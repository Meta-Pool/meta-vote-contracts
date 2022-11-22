import { Box, Spinner, Stack } from "@chakra-ui/react";
import React from "react";
import type { PageBlockerState } from '../../../types/pageblocker.types'

const PageBlocker = ({ message, isActive }: PageBlockerState) => {
  return (
    <Stack
      justify="center"
      alignItems="center"
      hidden={!isActive}
      h={"100vh"}
      w={"100vw"}
      position="fixed"
      top={0}
      zIndex={99999}
      backgroundColor="#735DE9"
      opacity={0.88}
    >
      <Box w="239px" h="153px" p={10} bg="#201b51" color="white">
        <Stack alignItems="center">
          <Box>
            <Spinner />
          </Box>
          <Box textAlign="center">{message}</Box>
        </Stack>
      </Box>
    </Stack>
  );
};

export default PageBlocker;
