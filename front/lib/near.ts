import {
  keyStores,
  connect,
  WalletConnection,
  Contract,
  providers,
  ConnectConfig,
} from "near-api-js";
import { getTransactionLastResult } from "near-api-js/lib/providers";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import { AccountView } from "near-api-js/lib/providers/provider";
const BN = require("bn.js");
import { getConfig } from "../config";
import { TransactionStatusResult } from "../types/transactions.types";
import {
  metavoteViewMethods,
  metavoteChangeMethods,
  metaPoolMethods,
  metaTokenMethods,
  projectTokenViewMethods,
  getMetaViewMethods,
  getMetaChangeMethods,
} from "./methods";
import {
  checkPanicError,
  decodeJsonRpcData,
  encodeJsonRpcData,
  getLogsAndErrorsFromReceipts,
  getPanicError,
  getPanicErrorFromText,
  getTxFunctionCallMethod,
  yton,
} from "./util";
import { blockerStore } from "../stores/pageBlocker";
import { Wallet } from "@near-wallet-selector/core";
import { MetapoolContractState } from "../types/metapool.types";

export const CONTRACT_ID =
  process.env.NEXT_PUBLIC_CONTRACT_ID || "metavote.testnet";
const env = process.env.NEXT_PUBLIC_VERCEL_ENV || "development";
export const NETWORK_ID =
  process.env.NEXT_PUBLIC_VERCEL_ENV == "production" ? "mainnet" : "testnet";
export const IS_PRODUCTION = NETWORK_ID == "mainnet";
export const METAPOOL_CONTRACT_ID =
  process.env.NEXT_PUBLIC_METAPOOL_CONTRACT_ID || "meta-v2.pool.testnet";
export const METAPOOL_DEV_CONTRACT_ID =
  process.env.NEXT_PUBLIC_METAPOOL_DEV_CONTRACT_ID;
export const META_CONTRACT_ID =
  process.env.NEXT_PUBLIC_META_CONTRACT_ID || "token.meta.pool.testnet";
export const GET_META_CONTRACT_ID = process.env.NEXT_PUBLIC_GET_META_CONTRACT;
export const gas = new BN("70000000000000");
export const GAS = "200000000000000";
export const TRANSFER_CALL_DEPOSIT = "1";
const nearConfig = getConfig(env);
const provider = new providers.JsonRpcProvider({ url: nearConfig.nodeUrl });

export type Account = AccountView & {
  account_id: string;
};

export const getNearConfig = () => {
  return nearConfig;
};

export const signOutWallet = async (wallet: Wallet) => {
  blockerStore.setState({ isActive: true });
  wallet
    .signOut()
    .catch((err) => {
      console.log("Failed to sign out");
      console.error(err);
    })
    .finally(() => {
      blockerStore.setState({ isActive: false });
    });
};

export const getConnection = async () => {
  const connectConfig: ConnectConfig = {
    ...nearConfig,
    headers: {},
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  };
  const nearConnection = await connect(connectConfig);
  return nearConnection;
};

export const getAccount = async () => {
  const accountId = window.account_id;
  const account = provider
    .query<Account>({
      request_type: "view_account",
      finality: "final",
      account_id: accountId,
    })
    .then((data) => ({
      ...data,
      account_id: accountId,
    }));
  return account;
};

export const getStNearPrice = async () => {
  return callPublicMetapoolMethod(metaPoolMethods.getStNearPrice, {});
};

export const getMetapoolAccountInfo = async () => {
  const account_id = window.account_id;
  return callViewMetapoolMethod(metaPoolMethods.getAccountInfo, {
    account_id: account_id,
  });
};

export const getMetapoolContractState =
  async (): Promise<MetapoolContractState> => {
    return callViewMetapoolMethod(metaPoolMethods.getContractState, {});
  };

export const getMetaTokenAccountInfo = async () => {
  const account_id = window.account_id;
  if (!account_id) return 0;
  return callViewMetaTokenMethod(metaTokenMethods.getMetas, {
    account_id: account_id,
  });
};

export const getVestingInfo = async () => {
  const account_id = window.account_id;
  return callViewMetaTokenMethod(metaTokenMethods.getVestingInfo, {
    account_id: account_id,
  });
}

export const getMetaBalance = async (): Promise<number> => {
  const accountInfo = await getMetaTokenAccountInfo();
  return yton(accountInfo);
};

export const getBalanceStNear = async (): Promise<string> => {
  if (IS_PRODUCTION) {
    const accountInfo = await getMetapoolAccountInfo();
    return accountInfo.st_near;
  }
  const account_id = window.account_id;
  return getTokenBalanceOf(METAPOOL_DEV_CONTRACT_ID!, account_id!);
};

export const getTxStatus = async (
  txHash: string,
  account_id: string
): Promise<TransactionStatusResult> => {
  // const decodedTxHash = utils.serialize.base_decode(txHash);
  const finalExecutionOutcome = await provider.txStatus(txHash, account_id);
  const txUrl = `${nearConfig.explorerUrl}/transactions/${txHash}`;
  const method = getTxFunctionCallMethod(finalExecutionOutcome);
  const panicError = getPanicError(finalExecutionOutcome);
  if (!finalExecutionOutcome) {
    return { found: false };
  }
  if (panicError) {
    return {
      success: false,
      found: true,
      errorMessage: panicError,
      method: method,
      transactionExplorerUrl: txUrl,
    };
  }
  return {
    success: true,
    found: true,
    data: getTransactionLastResult(finalExecutionOutcome),
    method: method,
    finalExecutionOutcome: finalExecutionOutcome,
    transactionExplorerUrl: txUrl,
  };
};

export const getContractMetadata = async (contract: string) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: contract,
    method_name: projectTokenViewMethods.metadata,
    args_base64: encodeJsonRpcData({}),
  });
  return decodeJsonRpcData(response.result);
};

const callPublicMetavoteMethod = async (method: string, args: any) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: CONTRACT_ID,
    method_name: method,
    args_base64: encodeJsonRpcData(args),
  });

  return decodeJsonRpcData(response.result);
};

const callChangeMetavoteMethod = async (method: string, args: any, deposit?: string): Promise<FinalExecutionOutcome | null> => {
  const wallet = window.wallet || await window.selector.wallet();
  const account_id = window.account_id;
  blockerStore.setState({ isActive: true });
  const result = await wallet!
    .signAndSendTransaction({
      signerId: account_id!,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: method,
            args: args,
            gas: GAS,
            deposit: deposit ? deposit : "",
          },
        },
      ],
    })
    .catch((err) => {
      console.error(`Failed to call metavote contract -- method: ${method}`);
      throw getPanicErrorFromText(err.message);
    }).
    finally(()=> {
      blockerStore.setState({isActive: false});
    });
    if (result instanceof Object) {
      return result;
    }
  return null;
};

const callPublicMetapoolMethod = async (method: string, args: any) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: META_CONTRACT_ID,
    method_name: method,
    args_base64: encodeJsonRpcData(args),
  });

  return decodeJsonRpcData(response.result);
};

const callViewMetapoolMethod = async (method: string, args: any) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "optimistic",
    account_id: METAPOOL_CONTRACT_ID,
    method_name: method,
    args_base64: encodeJsonRpcData(args),
  });

  return decodeJsonRpcData(response.result);
};

const callViewMetaTokenMethod = async (method: string, args: any) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "optimistic",
    account_id: META_CONTRACT_ID,
    method_name: method,
    args_base64: encodeJsonRpcData(args),
  });

  return decodeJsonRpcData(response.result);
};

const callViewGetMetaMethod = async (method: string, args: any) => {
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "optimistic",
    account_id: GET_META_CONTRACT_ID,
    method_name: method,
    args_base64: encodeJsonRpcData(args),
  });

  return decodeJsonRpcData(response.result);
};

export const getBalanceOfTokenForSupporter = async (
  tokenContractAddress: string
) => {
  const account_id = window.account_id;
  const response: any = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: tokenContractAddress,
    method_name: projectTokenViewMethods.storageBalanceOf,
    args_base64: encodeJsonRpcData({ account_id: account_id }),
  });
  return decodeJsonRpcData(response.result);
};

const callChangeMetaTokenMethod = async (method: string, args: any) => {
  let wallet = window.wallet || await window.selector.wallet();
  const account_id = window.account_id;
  blockerStore.setState({ isActive: true });
  const result = await wallet!.signAndSendTransaction({
    signerId: account_id!,
    receiverId: META_CONTRACT_ID,
    actions: [
      {
        type: "FunctionCall",
        params: {
          methodName: method,
          args: args,
          gas: GAS,
          deposit: "1",
        }
      }]
    }).catch((err) => {
      console.error(`Failed to call metavote contract -- method: ${method}`);
      throw getPanicErrorFromText(err.message);
    }).finally(()=> {
      blockerStore.setState({isActive: false});
    })
    checkPanicError(result);
    if (result instanceof Object) {
      return result;
    }
  return null;
};

/*********** METAVOTE VIEW METHODS *************/

export const getAvailableVotingPower = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getAvailableVotingPower, {
    voter_id: window.account_id,
  });
};

export const getInUseVotingPower = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getUsedVotingPower, {
    voter_id: window.account_id,
  });
};

export const getAllLockingPositions = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getAllLockingPositions, {
    voter_id: window.account_id,
  });
};

export const getBalanceMetaVote = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getBalance, {
    voter_id: window.account_id,
  });
};

export const getLockedBalance = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getLockedBalance, {
    voter_id: window.account_id,
  });
};

export const getUnlockingBalance = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getUnlockingBalance, {
    voter_id: window.account_id,
  });
};

export const getVotes = async (id: string, contract: string) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getTotalVotes, {
    contract_address: contract,
    votable_object_id: id,
  });
};

export const getVotesByContract = async (contract: string) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getVotesByContract, {
    contract_address: contract,
  });
};

export const getVotesByVoter = async () => {
  return callPublicMetavoteMethod(metavoteViewMethods.getVotesByVoter, {
    voter_id: window.account_id,
  });
};

/*********** METAVOTE CHANGE METHODS *************/
export const voteProject = async (
  id: string,
  contractName: string,
  votingPower: string
) => {
  const args = {
    voting_power: votingPower,
    contract_address: contractName,
    votable_object_id: id,
  };
  return callChangeMetavoteMethod(metavoteChangeMethods.vote, args);
};

export const unvoteProject = async (id: string, votableObjAddress: string) => {
  const args = {
    contract_address: votableObjAddress,
    votable_object_id: id,
  };
  return callChangeMetavoteMethod(metavoteChangeMethods.unvote, args);
};

export const lock = async (days: string, amount: string) => {
  const args = {
    receiver_id: CONTRACT_ID,
    amount: amount,
    msg: days,
  };
  return callChangeMetaTokenMethod("ft_transfer_call", args);
};

export const unlock = async (positionId: string) => {
  const args = {
    index: positionId,
  };
  return callChangeMetavoteMethod(metavoteChangeMethods.unlockPosition, args);
};

export const withdrawAPosition = async (positionId: string) => {
  const args = {
    position_index_list: positionId ? [positionId] : [],
    amount_from_balance: "0",
  };
  return callChangeMetavoteMethod(metavoteChangeMethods.withdraw, args);
};

export const withdrawAll = async () => {
  const args = {};
  return callChangeMetavoteMethod(metavoteChangeMethods.withdrawAll, args);
};

export const relock = async (
  positionIndex: string,
  period: string,
  amount: string
) => {
  const args = {
    index: positionIndex,
    locking_period: period,
    amount_from_balance: "0",
  };
  return callChangeMetavoteMethod(metavoteChangeMethods.relock, args);
};

/*********** GETMETA METHODS *************/
export const getWhitelistedTokens = async () => {
  return callViewGetMetaMethod(getMetaViewMethods.getWhitelistedTokens, {});
};

export const computeMetaAmountOnReturn = async (
  token_contract_address: string,
  token_amount: string
) => {
  return callViewGetMetaMethod(getMetaViewMethods.computeMetaAmountOnReturn, {
    token_contract_address,
    token_amount,
  });
};

export const getTokenBalanceOf = async (
  tokenContractAddress: string,
  accountId: string
) => {
  if (!accountId) return 0;

  const response: any = await provider.query({
    request_type: "call_function",
    finality: "final",
    account_id: tokenContractAddress,
    method_name: projectTokenViewMethods.balanceOf,
    args_base64: encodeJsonRpcData({ account_id: accountId }),
  });
  return decodeJsonRpcData(response.result);
};

export const getNearBalance = async (accountId: string) => {
  const response: any = await provider.query({
    request_type: "view_account",
    finality: "final",
    account_id: accountId,
  });
  return response.amount;
};

export const getMetaContractFee = async () => {
  return callViewGetMetaMethod(getMetaViewMethods.getMetaFee, {});
};

export const depositToken = async (
  tokenContracId: string,
  amount: string,
  minMetaAmountExpected: string
) => {
  const wallet = window.wallet;
  const account_id = window.account_id;
  const args = {
    amount: amount,
    receiver_id: GET_META_CONTRACT_ID,
    msg: minMetaAmountExpected,
  };
  const result = await wallet!
    .signAndSendTransaction({
      signerId: account_id!,
      receiverId: tokenContracId,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: getMetaChangeMethods.depositToken,
            args: args,
            gas: GAS,
            deposit: TRANSFER_CALL_DEPOSIT,
          },
        },
      ],
    })
    .catch((err) => {
      console.log("Failed to fund to kickstarter");

      throw getPanicErrorFromText(err.message);
    })
    .finally(() => {
      blockerStore.setState({ isActive: false });
    });
  if (result instanceof Object) {
    return result;
  }
  return null;
};

export const depositNear = async (
  amount: string,
  minMetaAmountExpected: string
) => {
  const wallet = window.wallet;
  const account_id = window.account_id;
  const args = {
    min_amount_expected: minMetaAmountExpected,
  };
  const result = await wallet!
    .signAndSendTransaction({
      signerId: account_id!,
      receiverId: GET_META_CONTRACT_ID,
      actions: [
        {
          type: "FunctionCall",
          params: {
            methodName: getMetaChangeMethods.depositNear,
            args: args,
            gas: GAS,
            deposit: amount,
          },
        },
      ],
    })
    .catch((err) => {
      console.log("Failed to fund to kickstarter");

      throw getPanicErrorFromText(err.message);
    })
    .finally(() => {
      blockerStore.setState({ isActive: false });
    });
  if (result instanceof Object) {
    return result;
  }
  return null;
};