import { BoxProps, useToast } from '@chakra-ui/react'
import { useRouter } from 'next/router';
import * as React from 'react'
import { useEffect, useState } from 'react';
import { ErrorHashHandler } from '../../utils/errorHandlers';

const ErrorHandlerHash = (props: BoxProps) => {
  const router = useRouter();
  const toast = useToast();
  const transactionHashes = router.query.transactionHashes;
  const [isLoaded, setIsLoaded] = React.useState<boolean>(false);
  useEffect(() => {
    (async () => {
      ErrorHashHandler(router, toast);
      setIsLoaded(true);
    })();
  }, [transactionHashes, toast]);

  return (<></>)}

export default ErrorHandlerHash;