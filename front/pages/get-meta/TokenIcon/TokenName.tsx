import { Text, Image, HStack, TextProps } from "@chakra-ui/react";
import React from "react";
import { useGetTokenMetadata } from "../../../hooks/near";
import {
  isNearDenomination,
} from "./util";

interface TokenIconProps extends TextProps {
  denomination: string;
}
export default function TokenName({ denomination, ...props }: TokenIconProps) {
  const { data: metadata, isLoading } = useGetTokenMetadata(denomination);
  if (isNearDenomination(denomination)) {
    return <Text {...props}>{denomination}</Text>;
  }
  return !isLoading && metadata ? (

      <Text {...props}>{metadata?.name}</Text>

  ) : null;
}
