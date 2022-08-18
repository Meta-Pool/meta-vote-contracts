/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Button,
} from "@chakra-ui/react";
import { useWalletSelector } from "../../contexts/WalletSelectorContext";

const ButtonOnLogin = (props: any) => {
  const { selector, modal} = useWalletSelector();

  const onConnect = async () => {
    modal.show();
  };
  return (
    selector?.isSignedIn() ? (
    <>
      { props.children}
    </> ) : (
      <Button
        color="blue"
        borderColor="blue"
        borderRadius={100}
        variant="outline"
        onClick={() => onConnect()}
      >
        Connect Wallet
      </Button>
    ) 
  );
};

export default ButtonOnLogin;
