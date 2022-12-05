import { useQuery } from "react-query";
import {
  FETCH_NEAR_PRICE_INTERVAL,
  FETCH_TOKEN_BALANCE_INTERVAL,
} from "../constants";
import {
  getBalanceStNear,
  getContractMetadata,
  getNearBalance,
  getTokenBalanceOf,
} from "../lib/near";
import {
  isDenominationACurrency,
  isNearDenomination,
  isStNearDenomination,
} from "../pages/get-meta/TokenIcon/util";
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
      enabled: !isDenominationACurrency(tokenContract),
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

export const useGetBalance = (accountId: string, currency?: string) => {
  return useQuery(
    ["balance", currency, accountId],
    () => {
      if (isNearDenomination(currency)) {
        return getNearBalance(accountId!);
      } else if (isStNearDenomination(currency)) {
        return getBalanceStNear();
      }
      return getTokenBalanceOf(currency!, accountId!);
    },
    {
      onError: (err) => {
        console.error(err);
      },
      refetchInterval: FETCH_TOKEN_BALANCE_INTERVAL,
      staleTime: FETCH_TOKEN_BALANCE_INTERVAL,
      enabled: !!currency && !!accountId && currency !== null
    }
  );
};