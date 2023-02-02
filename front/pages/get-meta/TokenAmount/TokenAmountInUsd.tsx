import { Text, TextProps } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { number } from "yup";
import { useGetMetapoolContractState } from "../../../hooks/metapool";
import { useGetNearDollarPrice } from "../../../hooks/near";
import { formatToLocaleNear, yton } from "../../../lib/util";
import { isMetaDenomination, isStNearDenomination } from "../TokenIcon/util";
interface Props extends TextProps {
  currency?: string;
  amount?: number;
  stNearRate?: number;
}
const TokenAmountInUsd = ({ currency, amount, stNearRate, ...props }: Props) => {
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
        ≈ USD -
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
       ≈ USD {" "} {formatToLocaleNear(amount * nearPrice, 2)}
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
        ≈ USD {" "}
        {formatToLocaleNear(
          amount * yton(metapoolState?.st_near_price!) * nearPrice,
          2
        )}
      </Text>
    );
  if (isMetaDenomination(currency) && stNearRate ){
    return (
      <Text
        fontSize={"xs"}
        lineHeight={3}
        color={"gray.400"}
        letterSpacing="wide"
        {...props}
      >
        ≈ USD {" "}
        {formatToLocaleNear(
          amount * stNearRate * yton(metapoolState?.st_near_price!) * nearPrice,
          4
        )}
      </Text>
    );
  }  
  return (
    <Text
      fontSize={"xs"}
      lineHeight={3}
      color={"gray.400"}
      letterSpacing="wide"
      {...props}
    >
      ≈ USD N/A
    </Text>
  );
};

export default TokenAmountInUsd;
