import * as React from "react";
import { useState, useEffect } from "react";
import {
  Button,
  Text,
  ButtonProps,
  Box,
  Flex,
  HStack,
  Link,
  LinkOverlay,
  Container,
  useBreakpointValue,
  ButtonGroup,
  Spacer,
  Square,
  Image,
  useToast,
  Show,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  IconButton,
} from "@chakra-ui/react";
import { ChevronDownIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  getWallet,
  getMetaBalance,
  METAPOOL_CONTRACT_ID,
  getNearConfig,
} from "../../lib/near";
import { colors, primaryColor } from "../../constants/colors";
import { useStore as useWallet } from "../../stores/wallet";
import { useStore as useBalance } from "../../stores/balance";
import { useRouter } from "next/router";
import { formatToLocaleNear } from "../../lib/util";

const Header: React.FC<ButtonProps> = (props) => {
  const { wallet, setWallet, setLogin } = useWallet();
  const { balance, setBalance } = useBalance();
  const [signInAccountId, setSignInAccountId] = useState(null);
  const isDesktop = useBreakpointValue({ base: false, lg: true });
  const router = useRouter();
  const nearConfig = getNearConfig();
  const onConnect = async () => {
    try {
      wallet!.requestSignIn(METAPOOL_CONTRACT_ID, "Metapool contract");
    } catch (e) {
      console.log("error", e);
    }
  };

  const logout = async () => {
    await wallet!.signOut();
    const tempWallet = await getWallet();
    setWallet(tempWallet);
  };

  useEffect(() => {
    (async () => {
      if (wallet) {
      }
    })();
  }, [setLogin, wallet]);

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

        setLogin(tempWallet && tempWallet.getAccountId() ? true : false);
      } catch (e) {
        console.log(e);
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
    <Box as="section" pb={{ base: "12", md: "24" }}>
      <Box as="nav" alignContent="flex-end">
        <Container maxW="container.2xl" py={{ base: "3", lg: "4" }}>
          <HStack justify="space-between">
            <Flex
              onClick={() => router.push(`/`)}
              cursor="pointer"
              alignItems="center"
            >
              <Image objectFit="cover" src="/logo.svg" alt="logo" />
            </Flex>
            <Spacer />
            { isDesktop && (
                <Show above="md">
                <ButtonGroup variant="link" spacing="2" alignItems="flex-end">
                  {
                    wallet?.isSignedIn() && (
                      <Link href="/dashboard">
                        <Button
                          fontWeight={600}
                          fontSize={"md"}
                          color={primaryColor[500]}
                          aria-current="page"
                          variant="nav"
                        >
                          {" "}
                          My Dashboard{" "}
                        </Button>
                      </Link>
                    )
                  }
                  
                  <Link href="/faq">
                    <Button fontWeight={600} fontSize={"16px"} variant="nav">
                      {" "}
                      FAQ{" "}
                    </Button>
                  </Link>
                </ButtonGroup>
              </Show>
            )}
            
            <Spacer />
            {wallet?.isSignedIn() ? (
              <>
                <Show above="lg">
                  <Square minW="30px">
                    <Image
                      boxSize="20px"
                      objectFit="cover"
                      src="/meta.svg"
                      alt="stnear"
                    />
                  </Square>
                  <Text>{formatToLocaleNear(balance)}</Text>

                  <Button colorScheme={colors.primary}>
                    <LinkOverlay href={nearConfig.refFinance} isExternal>
                      Get $META
                    </LinkOverlay>
                  </Button>
                </Show>
                <Menu>
                  {isDesktop ? (
                    <MenuButton px={4} py={2}>
                      {signInAccountId} <ChevronDownIcon />
                    </MenuButton>
                  ) : (
                    <MenuButton
                      as={IconButton}
                      icon={<HamburgerIcon h="22px" />}
                      variant="none"
                    />
                  )}
                  <MenuList>
                      <MenuItem onClick={() => router.push("/#faq")}>
                        FAQ
                      </MenuItem>
                    {
                      wallet?.isSignedIn() && ( 
                        <>
                          <MenuItem
                              as={"a"}
                              href={`${nearConfig.explorerUrl}/accounts/${signInAccountId}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              My Wallet
                          </MenuItem>
                          <MenuItem onClick={() => router.push("/#dashboard")}>
                            My Dashboard
                          </MenuItem>
                          <MenuItem onClick={() => logout()}>Disconnect</MenuItem>
                        </>
                      )
                    }
                  </MenuList>
                </Menu>
              </>
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
