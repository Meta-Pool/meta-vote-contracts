/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Button, ButtonProps,
} from "@chakra-ui/react";
import { useStore as useWallet } from "../../stores/wallet";
import { METAPOOL_CONTRACT_ID } from "../../lib/near";
import { useWalletSelector } from "../contexts/WalletSelectorContext";

const ButtonOnLogin = (props: any) => {
  const { wallet } = useWallet();
  const { selector, modal, accounts, accountId } = useWalletSelector();

  const onConnect = async () => {
    try {
      wallet!.requestSignIn(METAPOOL_CONTRACT_ID, "Metapool contract");
    } catch (e) {
      console.error("error", e);
    }
  };
  return (
    selector?.isSignedIn() ? (
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
