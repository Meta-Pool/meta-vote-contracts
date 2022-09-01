import { BoxProps, useToast } from "@chakra-ui/react";
import { FinalExecutionOutcome } from "@near-wallet-selector/core";
import { useRouter } from "next/router";
import * as React from "react";
import { useEffect } from "react";
import { handleTransactionOutcome } from "../../utils/errorHandlers";

const ErrorHandlerHash = ({
  finalExecutionOutcome
}: {
  finalExecutionOutcome: FinalExecutionOutcome | null;
}) => {
  const toast = useToast();
  useEffect(() => {
    if (finalExecutionOutcome)
      handleTransactionOutcome(finalExecutionOutcome.transaction_outcome.id, toast);
  }, [finalExecutionOutcome, toast]);

  return <></>;
};

export default ErrorHandlerHash;
