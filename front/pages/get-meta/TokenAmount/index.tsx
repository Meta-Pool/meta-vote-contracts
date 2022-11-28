import React, { useState } from "react";
import {
  HStack,
  Text,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverArrow,
  PopoverBody,
  Stack,
  Button,
  IconButton,
  Avatar,
  VStack,
  StackProps,
  Input,
} from "@chakra-ui/react";
import { formatToLocaleNear } from "../../../lib/util";
import { colors } from "../../../constants/colors";
import TokenAmountInUsd from "./TokenAmountInUsd";
import TokenBalance from "./TokenBalance";
export interface Props extends StackProps {
  currency?: string;
  amount: number;
  setAmount: (value: number) => void;
}
const TokenAmount = ({ currency, amount, setAmount }: Props) => {
  return (
    <VStack pt={2} spacing={2} align="flex-end">
      <TokenBalance currency={currency} />
      <Input
        w={{ base: "100px", md: "150px" }}
        placeholder="Amount"
        type={"number"}
        color={colors.primary}
        onChange={(val) => setAmount(Number(val.target.value))}
      />

      <TokenAmountInUsd currency={currency} amount={amount} />
    </VStack>
  );
};

export default TokenAmount;
