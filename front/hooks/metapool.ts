import { useQuery } from "react-query";
import { FETCH_METAPOOL_STATE_INTERVAL, FETCH_TOKEN_BALANCE_INTERVAL } from "../constants";
import { getBalanceStNear, getMetapoolContractState } from "../lib/near";

export const useGetMetapoolContractState = () => {
  return useQuery("metapoolContractState", () => getMetapoolContractState(), {
    onError: (err) => {
      console.error(err);
    },
    refetchInterval: FETCH_METAPOOL_STATE_INTERVAL,
    staleTime: FETCH_METAPOOL_STATE_INTERVAL,
  });
};

export const useGetStNearBalance = (accountId: string) => {
  return useQuery<string>(["stnearBalance", accountId], () => getBalanceStNear(), {
    onError: (err) => {
      console.error(err);
    },
    refetchInterval: FETCH_TOKEN_BALANCE_INTERVAL,
    staleTime: FETCH_TOKEN_BALANCE_INTERVAL
  });
}