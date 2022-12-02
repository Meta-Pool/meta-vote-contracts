import {
  Box,
  Button,
  Center,
  HStack,
  Text,
  VStack,
  Image,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { colors } from "../../../constants/colors";

const FeatureComingSoon = () => {
  const router = useRouter();
  return (
    <Center h="full" minH="75vh">
      <Box rounded="3xl" bgColor={"gray.50"} p={"3rem"}>
        <HStack>
          <VStack direction="column" justify={"center"} align={"flex-start"}>
            <Text color={colors.darkViolet} fontSize="xl" w="280px">
              Coming soon..
            </Text>
            <Button
              variant="link"
              pb="5px"
              fontSize="xl"
              onClick={() => router.push("/")}
              rounded="none"
              borderBottom="1px"
            >
              Back to home
            </Button>
          </VStack>
        </HStack>
      </Box>
    </Center>
  );
};

export default FeatureComingSoon;
