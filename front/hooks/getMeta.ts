import { useQuery } from "react-query";
import { FETCH_WHITELISTED_TOKENS_INTERVAL } from "../constants";
import { getWhitelistedTokens, getMetaContractFee } from "../lib/near";

export const useGetWhitelistedTokens = () => {

    return useQuery(["whitelisted-tokens"], () => getWhitelistedTokens(), {
      onError: (err) => {
        console.error(err);
      },
      refetchInterval: FETCH_WHITELISTED_TOKENS_INTERVAL,
    });
  };

export const useGetMetaContractFee = () => {
  return useQuery('get-meta-fee', () => getMetaContractFee(), {
    onError: (err) => {
      console.error(err);
    },
  })
}