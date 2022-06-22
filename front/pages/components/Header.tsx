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
} from "@chakra-ui/react";
import {  HamburgerIcon } from "@chakra-ui/icons";
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

const Header: React.FC<ButtonProps> = (props) => {
  const { wallet, setWallet } = useWallet();
  const { balance, setBalance } = useBalance();
  const {  clearVoterData } = useVoter();
  const [signInAccountId, setSignInAccountId] = useState(null);
  
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
    <Box as="section" pb={{ base: "12", md: "12" }}>
      <Box as="nav" alignContent="flex-end">
        <Container maxW="container.2xl" py={{ base: "3", lg: "4" }}>
          <HStack justify="space-between">
          {wallet?.isSignedIn() && (
            <HStack
              onClick={() => router.push(`/`)}
              cursor="pointer"
              alignItems="center"
            >
              <Text>Hi</Text>
              <Text fontWeight={500} p={"10px 16px"} backgroundColor={colors.secundary+".900"}>{signInAccountId}</Text>
            </HStack>
          ) }
            <Spacer />
            {wallet?.isSignedIn() ? (
              <HStack spacing={10}>
                <HStack>
                  <Square minW="30px">
                    <Image
                      boxSize="20px"
                      objectFit="cover"
                      src="/meta.svg"
                      alt="stnear"
                    />
                  </Square>
                  <Text>{formatToLocaleNear(balance)}</Text>
                </HStack>
                
                  <Link href={nearConfig.refFinance} isExternal>
                    Get more $META
                  </Link>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<HamburgerIcon h="22px" />}
                    variant="none"
                    />
                  <MenuList>
                      <MenuItem  fontSize={'xl'}onClick={() => router.push("/#faq")}>
                        FAQ
                      </MenuItem>
                    {
                      wallet?.isSignedIn() && ( 
                        <>
                          <MenuItem fontSize={'xl'}
                              as={"a"}
                              href={`${nearConfig.explorerUrl}/accounts/${signInAccountId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              My Wallet
                          </MenuItem>
                          <MenuItem  fontSize={'xl'}onClick={() => router.push("/dashboard")}>
                            My Dashboard
                          </MenuItem>
                          <MenuItem  fontSize={'xl'}onClick={() => logout()}>Disconnect</MenuItem>
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
                onClick={() => onConnect()}
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
