import {
  keyStores,
  Near,
  connect,
  WalletConnection,
  utils,
  Contract,
  providers,
  ConnectConfig,
} from "near-api-js";
import { parseRpcError } from "near-api-js/lib/utils/rpc_errors";
import {
  FinalExecutionStatus,
  getTransactionLastResult,
} from "near-api-js/lib/providers";
const BN = require("bn.js");
import { getConfig } from "../config";
import { TransactionStatusResult } from "../types/transactions.types";
import {
  metavoteViewMethods,
  metavoteChangeMethods,
  metaPoolMethods,
  metaTokenMethods,
  projectTokenViewMethods,
  projectTokenChangeMethods,
} from "./methods";
import {
  decodeJsonRpcData,
  encodeJsonRpcData,
  getPanicError,
  getTxFunctionCallMethod,
  ntoy,
  yton,
} from "./util";
import { ExecutionError } from "near-api-js/lib/providers/provider";
import { Wallet } from "phosphor-react";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID;
export const METAPOOL_CONTRACT_ID = process.env.NEXT_PUBLIC_METAPOOL_CONTRACT_ID;
export const META_CONTRACT_ID =  process.env.NEXT_PUBLIC_META_CONTRACT_ID;

export const gas = new BN("70000000000000");
const env = process.env.NODE_ENV;
console.log('@env', env)
const nearConfig = getConfig(env);
const provider = new providers.JsonRpcProvider({ url: nearConfig.nodeUrl });

export const getNearConfig = () => {
  return nearConfig;
};

export const getWallet = async () => {
  const connectConfig: ConnectConfig = {
    ...nearConfig,
    headers: {},
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  };
  const near = await connect(connectConfig);
  const wallet = new WalletConnection(near, "katherine");
  return wallet;
};

export const signInWallet = async () => {
  const wallet = await getWallet();
  wallet.requestSignIn(METAPOOL_CONTRACT_ID, "Metapool contract");
  return wallet;
};

export const signOutWallet = async () => {
  const wallet = await getWallet();
  wallet!.signOut();
};

export const getContract = async (wallet: WalletConnection) => {
  return new Contract(wallet.account(), CONTRACT_ID!, {
    viewMethods: Object.values(metavoteViewMethods),
    changeMethods: Object.values(metavoteChangeMethods),
  });
};

export const getMetapoolContract = async (wallet: WalletConnection) => {
  return new Contract(wallet.account(), METAPOOL_CONTRACT_ID!, {
    viewMethods: Object.values(metaPoolMethods),
    changeMethods: ["ft_transfer_call"],
  });
};

export const getMetaTokenContract = async (wallet: WalletConnection) => {
  return new Contract(wallet.account(), META_CONTRACT_ID!, {
    viewMethods: Object.values(metaTokenMethods),
    changeMethods: ["ft_transfer_call"],
  });
};




export const getStNearPrice = async () => {
  return callPublicMetapoolMethod(metaPoolMethods.getStNearPrice, {});
};

export const getMetapoolAccountInfo = async (wallet: WalletConnection) => {
  return callViewMetapoolMethod(wallet, metaPoolMethods.getAccountInfo, {
    account_id: wallet.getAccountId(),
  });
};

export const getMetaTokenAccountInfo = async (wallet: WalletConnection) => {
  return callViewMetaTokenMethod(wallet, metaTokenMethods.getMetas, {
    account_id: wallet.getAccountId(),
  });
};

export const getMetaBalance = async (wallet: WalletConnection): Promise<number> => {
  const accountInfo = await getMetaTokenAccountInfo(wallet);
  return yton(accountInfo);
};

export const getBalance = async (wallet: WalletConnection): Promise<number> => {
  const accountInfo = await getMetapoolAccountInfo(wallet);
  return yton(accountInfo.st_near);
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

const callChangeMetavoteMethod = async (wallet: any, args: any, method: string) => {
  const contract = await getContract(wallet);
  const response = (contract as any)[method](args, "200000000000000");
  return response;
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

const callViewMetapoolMethod = async (
  wallet: WalletConnection,
  method: string,
  args: any
) => {
  const contract = await getMetapoolContract(wallet);
  return (contract as any)[method](args);
};

const callViewMetaTokenMethod = async (
  wallet: WalletConnection,
  method: string,
  args: any
) => {
  const contract = await getMetaTokenContract(wallet);
  return (contract as any)[method](args);
};

const callChangeMetaTokenMethod = async (
  wallet: WalletConnection,
  method: string,
  args: any
) => {
  const contract = await getMetaTokenContract(wallet);
  return (contract as any)[method](args, "300000000000000", // attached GAS (optional)
  "1000000000000000000000000");
};

/*********** METAVOTE VIEW METHODS *************/

export const getAvailableVotingPower = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getAvailableVotingPower, {voter_id: wallet.getAccountId()});
};

export const getInUseVotingPower = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getUsedVotingPower, {voter_id: wallet.getAccountId()});
};

export const getAllLockingPositions = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getAllLockingPositions, {voter_id: wallet.getAccountId()});
};

export const getBalanceMetaVote = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getBalance, {voter_id: wallet.getAccountId()});
};

export const getLockedBalance = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getLockedBalance, {voter_id: wallet.getAccountId()});
};

export const getUnlockingBalance = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getUnlockingBalance, {voter_id: wallet.getAccountId()});
};

export const getVotes = async (id: string, contract: string) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getTotalVotes, {
    contract_address: contract,
    votable_object_id: id
  });
};

/*********** METAVOTE CHANGE METHODS *************/


export const voteProject = async (id: string, contractName: string, votingPower: string, wallet: any ) => {
  const args = {
    voting_power: votingPower,
    contract_address: contractName,
    votable_object_id: id
  }
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.vote);
};

export const lock = async (id: string, contractName: string, votingPower: string, wallet: any ) => {
  const args = {
    receiver_id: votingPower,
    amount: contractName,
    votable_object_id: id
  }
  return  callChangeMetaTokenMethod(wallet,  "ft_transfer_call", args);
};
