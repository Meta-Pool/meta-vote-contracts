import {
  keyStores,
  connect,
  WalletConnection,
  Contract,
  providers,
  ConnectConfig,
} from "near-api-js";
import {
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
} from "./methods";
import {
  decodeJsonRpcData,
  encodeJsonRpcData,
  getPanicError,
  getTxFunctionCallMethod,
  yton,
} from "./util";

export const CONTRACT_ID = process.env.NEXT_PUBLIC_CONTRACT_ID;
export const NETWORK_ID =  process.env.NEXT_PUBLIC_NETWORK_ID || 'testnet';
export const METAPOOL_CONTRACT_ID = process.env.NEXT_PUBLIC_METAPOOL_CONTRACT_ID;
export const META_CONTRACT_ID =  process.env.NEXT_PUBLIC_META_CONTRACT_ID;
export const gas = new BN("70000000000000");

const env = 'development';

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
  const wallet = new WalletConnection(near, "metavote");
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

const callChangeMetavoteMethod = async (wallet: any, args: any, method: string, deposit?: string) => {
  const contract = await getContract(wallet); 
  let response;
  if (deposit) {
    response = (contract as any)[method](args, "200000000000000", deposit);
  } else {
    response = (contract as any)[method](args, "200000000000000");
  }
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
  return (contract as any)[method](args, "300000000000000", "1");
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

export const getVotesByContract = async (contract: string) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getVotesByContract, {
    contract_address: contract,
  });
};

export const getVotesByVoter = async (wallet: any) => {
  return callPublicMetavoteMethod(metavoteViewMethods.getVotesByVoter, {
    voter_id: wallet.getAccountId(),
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

export const unvoteProject = async (id: string, contractNameId: string, wallet: any ) => {
  const args = {
    contract_address: contractNameId,
    votable_object_id: id
  }
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.unvote);
};

export const lock = async (days: string, amount: string, wallet: any ) => {
  const args = {
    receiver_id: CONTRACT_ID,
    amount: amount,
    msg: days
  }
  return  callChangeMetaTokenMethod(wallet,  "ft_transfer_call", args);
};

export const unlock = async (positionId: string , wallet: any) => {
  const args = {
    index: positionId
  }
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.unlockPosition);
};

export const withdrawAPosition = async (positionId: string, wallet: any ) => {
  const args = {
    position_index_list: positionId ? [positionId] : [], 
    amount_from_balance: '0'
  }
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.withdraw);
};

export const withdrawAll = async (wallet: any) => {
  const args = {}
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.withdrawAll);
};

export const relock = async (positionIndex: string, period: string, amount: string, wallet: any ) => {
  const args = {
    index: positionIndex,
    locking_period: period,
    amount_from_balance: '0'
  }
  return  callChangeMetavoteMethod(wallet, args, metavoteChangeMethods.relock);
};
