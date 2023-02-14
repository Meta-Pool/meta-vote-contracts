import { HStack, Stack, StackProps, Text } from "@chakra-ui/layout";
import React, { ReactNode } from "react";
import { colors } from "../../constants/colors";
interface Props extends StackProps {
  name: string;
  children: ReactNode;
}
const DetailInfo = ({ name, children, ...props }: Props) => {
  return (
    <HStack justifyContent="space-between" spacing={10} w="full" {...props}>
      <Stack w="max-content" align="flex-end">
        <Text
          fontSize={props.fontSize || "xs"}
          lineHeight={3}
          color={props.color || "gray.400"}
          letterSpacing="wide"
        >
          {name}
        </Text>
      </Stack>
      <Stack justify="flex-end">
        <Text
          fontSize={props.fontSize || "xs"}
          lineHeight={3}
          color={props.color || colors.white}
          letterSpacing="wide"
        >
          {children}
        </Text>
      </Stack>
    </HStack>
  );
};

export default DetailInfo;
