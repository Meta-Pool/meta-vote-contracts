import { useQuery } from "react-query";
import {
  FETCH_NEAR_PRICE_INTERVAL,
  FETCH_TOKEN_BALANCE_INTERVAL,
} from "../constants";
import { getBalanceStNear, getContractMetadata, getNearBalance, getTokenBalanceOf } from "../lib/near";
import { isDenominationACurrency } from "../pages/get-meta/TokenIcon/util";
import { getNearDollarPrice } from "../queries/near";

export const useGetTokenMetadata = (tokenContract: string) => {
  return useQuery(
    ["metadata", tokenContract],
    () => getContractMetadata(tokenContract),
    {
      onError: (err) => {
        console.error(err);
      },
      cacheTime: Infinity,
      enabled: !isDenominationACurrency(tokenContract)
    }
  );
};

export const useGetNearDollarPrice = () => {
  return useQuery("nearDollarPrice", () => getNearDollarPrice(), {
    onError: (err) => {
      console.error(err);
    },
    refetchInterval: FETCH_NEAR_PRICE_INTERVAL,
    staleTime: FETCH_NEAR_PRICE_INTERVAL,
  });
};

export const useGetTokenBalanceOf = (
  tokenContractAddress: string,
  accountId: string
) => {
  return useQuery(
    ["tokenBalance", tokenContractAddress, accountId],
    () => getTokenBalanceOf(tokenContractAddress, accountId),
    {
      onError: (err) => {
        console.error(err);
      },
      refetchInterval: FETCH_TOKEN_BALANCE_INTERVAL,
      staleTime: FETCH_TOKEN_BALANCE_INTERVAL,
      enabled: !isDenominationACurrency(tokenContractAddress)
    }
  );
};

export const useGetNearBalance = (accountId: string) => {
  return useQuery<string>(["nearBalance", accountId], () => getNearBalance(accountId), {
    onError: (err) => {
      console.error(err);
    },
    refetchInterval: FETCH_TOKEN_BALANCE_INTERVAL,
    staleTime: FETCH_TOKEN_BALANCE_INTERVAL
  });
}