/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Button, ButtonProps,
} from "@chakra-ui/react";
import { useStore as useWallet } from "../../stores/wallet";
import { METAPOOL_CONTRACT_ID } from "../../lib/near";

const ButtonOnLogin = (props: any) => {
  const { wallet } = useWallet();

  const onConnect = async () => {
    try {
      wallet!.requestSignIn(METAPOOL_CONTRACT_ID, "Metapool contract");
    } catch (e) {
      console.error("error", e);
    }
  };
  return (
    wallet?.isSignedIn() ? (
    <>
      { props.children}
    </> ) : (
      <Button
        color="blue"
        borderColor="blue"
        variant="outline"
        onClick={() => onConnect()}
      >
        Connect Wallet
      </Button>
    ) 
  );
};

export default ButtonOnLogin;
