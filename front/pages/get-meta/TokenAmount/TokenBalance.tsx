import { Text, TextProps } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import {  useGetStNearBalance } from "../../../hooks/metapool";
import {
  useGetNearBalance,
  useGetTokenBalanceOf,
} from "../../../hooks/near";
import { formatToLocaleNear, yton } from "../../../lib/util";
import {
  isDenominationACurrency,
  isNearDenomination,
  isStNearDenomination,
} from "../TokenIcon/util";
interface Props extends TextProps {
  currency?: string;
}
const TokenBalance = ({ currency, ...props }: Props) => {
  const { accountId } = useWalletSelector();
  const {
    data: tokenBalance,
    isLoading: isLoadingTokenBalance,
    isRefetching: isRefetchingTokenBalance,
    refetch: refetchTokenBalance,
  } = useGetTokenBalanceOf(currency!, accountId!);
  const {
    data: nearBalace,
    isLoading: isLoadingNearBalance,
    isRefetching: isRefetchingNearBalance,
    refetch: refetchNearBalance,
  } = useGetNearBalance(accountId!);
  const {
    data: stnearBalance,
    isLoading: isLoadingStNearBalance,
    isRefetching: isRefetchingStNearBalance,
    refetch: refetchStNearBalance,
  } = useGetStNearBalance(accountId!);
  const [balance, setBalance] = useState<number | undefined>();

  useEffect(() => {
    console.log("currency change", currency);
    if (currency) {
      if (isNearDenomination(currency)) {
        refetchNearBalance();
      } else if (isStNearDenomination(currency)) {
        console.log("refetching stnear balance");
        refetchStNearBalance();
      } else {
        console.log("refetching token balance", currency);
        refetchTokenBalance();
      }
    }
  }, [currency]);

  useEffect(() => {
    if (currency) {
      console.log("getting balance for ", currency);
      if (!isDenominationACurrency(currency)) {
        setBalance(yton(tokenBalance));
      }
      if (isNearDenomination(currency)) {
        setBalance(yton(nearBalace!));
      }
      if (isStNearDenomination(currency)) {
        setBalance(yton(stnearBalance!));
      }
    }
  }, [tokenBalance, nearBalace, stnearBalance]);

  return (
    <Text
      fontSize={"xs"}
      lineHeight={3}
      color={"gray.400"}
      letterSpacing="wide"
      {...props}
    >
      Balance: {!balance ? "-" : formatToLocaleNear(balance)}
    </Text>
  );
};

export default TokenBalance;
