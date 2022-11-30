import { Text, TextProps } from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { colors } from "../../../constants/colors";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import {
  useGetBalance
} from "../../../hooks/near";
import { formatToLocaleNear, yton } from "../../../lib/util";
interface Props extends TextProps {
  currency?: string;
}
const TokenBalance = ({ currency, ...props }: Props) => {
  const { accountId } = useWalletSelector();
  const {
    data: balance,
    refetch
  } = useGetBalance(accountId!, currency);

  useEffect(() => {
    if (currency) {
     refetch()
    }
  }, [currency]);

  return (
    <Text
      fontSize={"sm"}
      lineHeight={3}
      color={colors.white}
      letterSpacing="wide"
      {...props}
    >
      Balance: {!balance ? "-" : formatToLocaleNear(yton(balance))}
    </Text>
  );
};

export default TokenBalance;
