import {
  Text,
  Image,
  HStack,
  TextProps,
  WrapItem,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import React from "react";
import { formatToLocaleNear, yton } from "../../../lib/util";
import { formatTimestampToDate } from "../../../utils/dateUtils";

export interface VestingInfoProps {
  amount: string;
  locked: string;
  locked_until_timestamp: number; // in nanoseconds
  linear_start_timestamp: number; // in nanoseconds
  linear_end_timestamp: number; // in nanoseconds
}
interface Props extends TextProps {
  vestingInfo?: VestingInfoProps;
  balance: number;
}
const VestingTooltip = ({
  vestingInfo,
  balance,
  children,
  ...props
}: Props) => {
  return vestingInfo ? (
    <Tooltip
      w="full"
      minW="390px"
      label={<TooltipText vestingInfo={vestingInfo} balance={balance} />}
      placement="bottom"
      defaultIsOpen
      closeDelay={100}
      hasArrow
      arrowSize={10}
    >
      {children}
    </Tooltip>
  ) : (
    <>{children}</>
  );
};

const TooltipText = ({ vestingInfo, balance }: Props) => {
  const unlockedBalance =
    Number(balance) - Number(yton(vestingInfo?.locked!)) > 0
      ? Number(balance) - Number(yton(vestingInfo?.locked!))
      : 0;
  return (
    <Text>
      You have a lockup account
      <br />
      Gradual release starts{" "}
      {formatTimestampToDate(
        Number(vestingInfo!.linear_start_timestamp) * 1000
      )}{" "}
      and ends{" "}
      {formatTimestampToDate(Number(vestingInfo!.linear_end_timestamp) * 1000)}
      <br />
      You have {formatToLocaleNear(yton(vestingInfo!.locked))} $META locked{" "}
      <br />
      You have {formatToLocaleNear(Number(unlockedBalance))} $META unlocked for
      transfer in the account
    </Text>
  );
};
export default VestingTooltip;
