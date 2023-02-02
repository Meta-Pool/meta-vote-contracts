import { Text, Image, HStack, StackProps } from "@chakra-ui/react";
import React from "react";
import { useGetTokenMetadata } from "../../../hooks/near";
import {
  getCurrencyTokenCalt,
  isDenominationACurrency,
  isNearDenomination,
} from "./util";

interface TokenIconProps extends StackProps {
  denomination: string;
}
export default function TokenIcon({ denomination, ...props }: TokenIconProps) {
  const { data: metadata, isLoading } = useGetTokenMetadata(denomination);
  if (isNearDenomination(denomination)) {
    return (
      <HStack {...props}>
        <Text
          fontFamily={"meta"}
          fontSize={"35px"}
          color={props.color || "gray.900"}
        >
          {getCurrencyTokenCalt("NEAR")}
        </Text>
        <Text color={props.color || "gray.900"}>{denomination}</Text>
      </HStack>
    );
  }
  return !isLoading && metadata ? (
    <HStack {...props}>
      <Image
        h={"35px"}
        w={"35px"}
        alt="token"
        src={metadata?.icon}
      />
      <Text color={props.color || "gray.900"}>{metadata?.symbol}</Text>
    </HStack>
  ) : null;
}
