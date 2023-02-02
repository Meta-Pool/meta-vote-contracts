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
  setAmountError?: (value: string | undefined) => void;
  readOnly?: boolean;
  stNearRate?: number;
}
const TokenAmount = ({
  currency,
  amount,
  setAmount,
  setAmountError,
  readOnly,
  stNearRate,
}: Props) => {
  const { accountId } = useWalletSelector();
  const { data: balance } = useGetBalance(accountId!, currency);

  useEffect(() => {
    if (setAmountError) {
      setAmountError(undefined);
      if (!currency) {
        setAmountError("Select a token");
      } else if (amount > yton(balance)) {
        setAmountError("Insufficient balance");
      }
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
        isReadOnly={readOnly}
      />
      <TokenAmountInUsd
        currency={currency}
        amount={amount}
        stNearRate={stNearRate}
      />
    </VStack>
  );
};

export default TokenAmount;
