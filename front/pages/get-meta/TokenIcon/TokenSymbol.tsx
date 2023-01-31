import { Text, Image, HStack, TextProps } from "@chakra-ui/react";
import React from "react";
import { useGetTokenMetadata } from "../../../hooks/near";
import {
  isNearDenomination,
} from "./util";

interface Props extends TextProps {
  denomination: string;
}
export default function TokenSymbol({ denomination, ...props }: Props) {
  const { data: metadata, isLoading } = useGetTokenMetadata(denomination);
  if (isNearDenomination(denomination)) {
    return <Text {...props}>{denomination}</Text>;
  }
  return !isLoading && metadata ? (

      <Text {...props}>{metadata?.symbol}</Text>

  ) : null;
}
