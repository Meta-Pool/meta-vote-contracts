/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Button,
} from "@chakra-ui/react";
import { useWalletSelector } from "../../contexts/WalletSelectorContext";
import { AddIcon } from "@chakra-ui/icons";

interface Props {
  variant?: string,
  color?: string,
  children?: any
}

const ButtonOnLogin = (props: Props) => {
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
        //color={props.color ? props.color : "blue"}
        leftIcon={<AddIcon />}
        colorScheme={props.color}
        borderColor="blue"
        borderRadius={100}
        variant={props.variant ? props.variant : "outline"}
        onClick={() => onConnect()}
      >
        Connect Wallet
      </Button>
    ) 
  );
};

export default ButtonOnLogin;
