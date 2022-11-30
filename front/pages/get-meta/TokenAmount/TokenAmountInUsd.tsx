import { Text, TextProps } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useGetMetapoolContractState } from "../../../hooks/metapool";
import { useGetNearDollarPrice } from "../../../hooks/near";
import { formatToLocaleNear, yton } from "../../../lib/util";
import { isStNearDenomination } from "../TokenIcon/util";
interface Props extends TextProps {
  currency?: string;
  amount?: number;
}
const TokenAmountInUsd = ({ currency, amount, ...props }: Props) => {
  const { data: nearPrice, isLoading: isLoadingNearPrice } =
    useGetNearDollarPrice();
  const { data: metapoolState, isLoading: isLoadingMetapool } =
    useGetMetapoolContractState();

  if (!currency || !amount || amount == 0)
    return (
      <Text
        fontSize={"xs"}
        lineHeight={3}
        color={"gray.400"}
        letterSpacing="wide"
        {...props}
      >
        {" "}
        ~ USD -
      </Text>
    );
  if (currency == "NEAR")
    return (
      <Text
        fontSize={"xs"}
        lineHeight={3}
        color={"gray.400"}
        letterSpacing="wide"
        {...props}
      >
        ~ USD {formatToLocaleNear(amount * nearPrice, 2)}
      </Text>
    );
  if (isStNearDenomination(currency))
    return (
      <Text
        fontSize={"xs"}
        lineHeight={3}
        color={"gray.400"}
        letterSpacing="wide"
        {...props}
      >
        ~ USD
        {formatToLocaleNear(
          amount * yton(metapoolState?.st_near_price!) * nearPrice,
          2
        )}
      </Text>
    );
  return (
    <Text
      fontSize={"xs"}
      lineHeight={3}
      color={"gray.400"}
      letterSpacing="wide"
      {...props}
    >
      ~ USD N/A
    </Text>
  );
};

export default TokenAmountInUsd;
