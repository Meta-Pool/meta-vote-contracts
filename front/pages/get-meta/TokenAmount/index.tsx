import React, { useEffect } from "react";
import { VStack, StackProps, Input, Stack, Text } from "@chakra-ui/react";
import { colors } from "../../../constants/colors";
import TokenAmountInUsd from "./TokenAmountInUsd";
import TokenBalance from "./TokenBalance";
import { useGetBalance } from "../../../hooks/near";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import { yton } from "../../../lib/util";
export interface Props extends StackProps {
  currency?: string;
  amount: number;
  setAmount: (value: number) => void;
  setAmountError: (value: string | undefined) => void;
}
const TokenAmount = ({
  currency,
  amount,
  setAmount,
  setAmountError,
}: Props) => {
  const { accountId } = useWalletSelector();
  const { data: balance } = useGetBalance(accountId!, currency);

  useEffect(() => {
    setAmountError(undefined);
    if (amount > yton(balance)) {
      setAmountError("Insufficiente balance");
    }
  }, [balance, amount, currency]);

  return (
    <VStack pt={2} spacing={2} align="flex-end">
      <TokenBalance currency={currency} />
      <Input
        w={{ base: "100px", md: "150px" }}
        placeholder="Amount"
        type={"number"}
        color={colors.primary}
        onPaste={(e) => setAmount(Number(e.currentTarget.value))}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
      />
      <TokenAmountInUsd currency={currency} amount={amount} />
    </VStack>
  );
};

export default TokenAmount;
