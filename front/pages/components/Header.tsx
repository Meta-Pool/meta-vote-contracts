import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Text,
  ButtonProps,
  Box,
  HStack,
  Link,
  Container,
  Spacer,
  Square,
  Image,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  useBreakpointValue,
} from "@chakra-ui/react";
import {  ExternalLinkIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  getWallet,
  getMetaBalance,
  METAPOOL_CONTRACT_ID,
  getNearConfig,
} from "../../lib/near";
import { colors } from "../../constants/colors";
import { useStore as useWallet } from "../../stores/wallet";
import { useStore as useBalance } from "../../stores/balance";
import { useRouter } from "next/router";
import { formatToLocaleNear } from "../../lib/util";
import { useStore as useVoter } from "../../stores/voter";
import VPositionCard from "./MyDashboard/VPositionCard";
import { useWalletSelector } from "../contexts/WalletSelectorContext";

const Header: React.FC<ButtonProps> = (props) => {
  const { wallet, setWallet } = useWallet();
  const { balance, setBalance } = useBalance();
  const {  clearVoterData } = useVoter();
  const [signInAccountId, setSignInAccountId] = useState(null);
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const { selector, modal, accounts, accountId } = useWalletSelector();


  const router = useRouter();
  const nearConfig = getNearConfig();
  const onConnect = async () => {
    try {
      wallet!.requestSignIn(METAPOOL_CONTRACT_ID, "Metapool contract");
    } catch (e) {
      console.error("error", e);
    }
  };

  const logout = async () => {
    clearVoterData();
    await wallet!.signOut();
    const tempWallet = await getWallet();
    setWallet(tempWallet);
  };

  const handleSignIn = () => {
    modal.show();
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();

    wallet.signOut().catch((err: any) => {
      console.log("Failed to sign out");
      console.error(err);
    });
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
        
      }
    })();
  }, [ wallet]);

  useEffect(() => {
    (async () => {
      try {
        const tempWallet = await getWallet();
        if (!wallet) {
          setWallet(tempWallet);
        }
        if (tempWallet && tempWallet.getAccountId()) {
          setSignInAccountId(tempWallet.getAccountId());
          setBalance(await getMetaBalance(tempWallet!));
        }
      } catch (e) {
        console.error(e);
      }
    })();

    setInterval(async () => {
      const tempWallet = await getWallet();
      if (tempWallet && tempWallet.getAccountId()) {
        const balance = await getMetaBalance(tempWallet);
        setBalance(balance);
      }
    }, 5000);
  }, []);

  return (
    <Box color={"white"} bg={"#4121EE"}>
      <Box as="nav" alignContent="flex-end">
        <Container maxW="container.2xl" py={{ base: "3", lg: "4" }}>
          <HStack justify="space-between">
          {selector?.isSignedIn() && (
            <HStack
              onClick={() => router.push(`/`)}
              cursor="pointer"
              alignItems="center"
              p={"5px 16px"} 
              borderRadius={100} 
              backgroundColor={colors.primary+".900"}
            >
              <Text  noOfLines={1} maxW={'20vw'}   fontWeight={500} >{signInAccountId} </Text>
              <ExternalLinkIcon></ExternalLinkIcon>
            </HStack>
          ) }
            <Spacer />
            {selector?.isSignedIn() ? (
              <HStack spacing={10}>
                <HStack>
                  <Square minW="30px">
                    <Image
                      boxSize="20px"
                      objectFit="cover"
                      src="/meta_white.png"
                      alt="stnear"
                    />
                  </Square>
                  <Text fontFamily={'Meta Space'} fontSize={'18px'} fontWeight={500}>{formatToLocaleNear(balance)}</Text>
                </HStack>

                 {
                  isDesktop && (
                    <HStack
                      cursor="pointer"
                      alignItems="center"
                      p={"5px 16px"} 
                      borderRadius={100} 
                      backgroundColor={colors.primary+".900"}>
                      <Link fontWeight={500} href={nearConfig.refFinance} isExternal>
                        Get more $META
                      </Link>
                      <ExternalLinkIcon></ExternalLinkIcon>
                    </HStack>
                  
                  )
                 }
                  
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<HamburgerIcon h="22px" />}
                    variant="none"
                    />
                  <MenuList color={colors.primary}>
                      
                    {
                     selector?.isSignedIn() && ( 
                        <>
                          <MenuItem fontSize={'xl'}
                              as={"a"}
                              href={`${nearConfig.explorerUrl}/accounts/${signInAccountId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              My Wallet
                          </MenuItem>

                          <MenuItem  fontSize={'xl'}onClick={() => handleSignOut()}>Disconnect</MenuItem>
                        </>
                      )
                    }
                  </MenuList>
                </Menu>
              </HStack>
            ) : (
              <Button
                color="blue"
                borderColor="blue"
                variant="outline"
                borderRadius={100}
                onClick={() => handleSignIn()}
              >
                Connect Wallet
              </Button>
            )}
          </HStack>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
