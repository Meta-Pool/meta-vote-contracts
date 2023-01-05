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
}
const VestingTooltip = ({ vestingInfo, children, ...props }: Props) => {
  return vestingInfo ? (
    <Tooltip w="full" minW="390px"
      label={<TooltipText vestingInfo={vestingInfo} />}
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

const TooltipText = ({ vestingInfo }: { vestingInfo: VestingInfoProps }) => (
  <Text>
    You have a lockup account
    <br />
    Gradual relase starts{" "}
    {formatTimestampToDate(
      Number(vestingInfo.linear_start_timestamp) * 1000
    )}{" "}
    and ends{" "}
    {formatTimestampToDate(Number(vestingInfo.linear_end_timestamp) * 1000)}
    <br />
    You still have {formatToLocaleNear(yton(vestingInfo.locked))} $META locked
    in the account
  </Text>
);
export default VestingTooltip;
