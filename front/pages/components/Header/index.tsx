import React, { useState } from "react";
import { useEffect } from "react";
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
  useDisclosure,
  VStack,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { ExternalLinkIcon, HamburgerIcon } from "@chakra-ui/icons";
import {
  getMetaBalance,
  getNearConfig,
  getVestingInfo,
  signOutWallet,
} from "../../../lib/near";
import { colors } from "../../../constants/colors";
import { useStore as useBalance } from "../../../stores/balance";
import { useRouter } from "next/router";
import { formatToLocaleNear } from "../../../lib/util";
import { useStore as useVoter } from "../../../stores/voter";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import ButtonOnLogin from "../ButtonLogin";
import { GET_META_ENABLED } from "../../../constants";
import VestingTooltip, { VestingInfoProps } from "./VestingTooltip";

const Header: React.FC<ButtonProps> = (props) => {
  const { balance, setBalance } = useBalance();
  const [vestingInfo, setVestingInfo] = useState<VestingInfoProps | undefined>();
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const { selector, modal, accounts, accountId } = useWalletSelector();

  const router = useRouter();
  const nearConfig = getNearConfig();

  const handleSignIn = () => {
    modal.show();
  };

  const handleSwitchWallet = () => {
    modal.show();
  };

  const handleSignOut = async () => {
    const wallet = await selector.wallet();
    signOutWallet(wallet);
  };

  const updateBalance = async () => {
    if (selector.isSignedIn() && accountId) {
      setBalance(await getMetaBalance());
    }
  };

  const updateVestingInfo = async () => {
    if (selector.isSignedIn() && accountId) {
      try{
      setVestingInfo(await getVestingInfo());
      }
      catch(e) {
        console.log(e);
        setVestingInfo(undefined)
      }
    }
  };

  useEffect(() => {
    (async () => {
      try {
        updateBalance();
        updateVestingInfo();
      } catch (e) {
        console.error(e);
      }
    })();

    setInterval(async () => {
      try {
        updateBalance();
        updateVestingInfo();
      } catch (e) {
        console.error(e);
      }
    }, 5000);
  }, []);

  return (
    <Box hidden={!selector?.isSignedIn()} color={"white"} bg={"#4121EE"}>
      <Box as="nav" alignContent="flex-end">
        <Container maxW="container.2xl" py={{ base: "3", lg: "4" }}>
          <HStack justify="space-between">
            <Image alt="logo metavote" src="/metavote_logo.svg"></Image>
            <Spacer />

            {selector?.isSignedIn() ? (
              <HStack spacing={{ base: 1, md: 6 }}>
                <HStack>
                  <Square minW="30px">
                    <Image
                      boxSize={{ base: "10px", md: "20px" }}
                      objectFit="cover"
                      src="/meta_white.png"
                      alt="meta"
                    />
                  </Square>
                   <VestingTooltip vestingInfo={vestingInfo} balance={balance}>
                    <Text
                      fontFamily={"Meta Space"}
                      fontSize={{ base: "10px", md: "18px" }}
                      fontWeight={500}
                    >
                      {formatToLocaleNear(balance)}
                    </Text>
                  </VestingTooltip>
                </HStack>

                {isDesktop && !GET_META_ENABLED && (
                  <HStack
                    cursor="pointer"
                    alignItems="center"
                    p={"5px 16px"}
                    borderRadius={100}
                    backgroundColor={colors.primary + ".900"}
                  >
                    <Link
                      fontWeight={500}
                      href={nearConfig.refFinance}
                      isExternal
                    >
                      Get more $META
                    </Link>
                    <ExternalLinkIcon></ExternalLinkIcon>
                  </HStack>
                )}
                {isDesktop && GET_META_ENABLED && (
                  <ButtonOnLogin>
                    <Button
                      borderRadius={100}
                      fontSize={{ base: "md", md: "md" }}
                      variant={"outline"}
                      colorScheme={colors.primary}
                      onClick={() => router.push("/get-meta")}
                    >
                      Get more $META
                    </Button>
                  </ButtonOnLogin>
                )}

                {isDesktop && selector?.isSignedIn() && (
                  <Link
                    href={`${nearConfig.explorerUrl}/accounts/${accountId}`}
                    isExternal
                  >
                    <HStack
                      onClick={() => router.push(`/`)}
                      cursor="pointer"
                      alignItems="center"
                      p={"5px 16px"}
                      borderRadius={100}
                      backgroundColor={colors.primary + ".900"}
                    >
                      <Text noOfLines={1} maxW={"20vw"} fontWeight={500}>
                        {accountId}{" "}
                      </Text>
                      <ExternalLinkIcon></ExternalLinkIcon>
                    </HStack>
                  </Link>
                )}

                <Menu>
                  <MenuButton
                    as={IconButton}
                    icon={<Image src="/icons/dots.svg" h="22px" />}
                    variant="none"
                  />
                  <MenuList color={colors.primary}>
                    {selector?.isSignedIn() && (
                      <>
                        <MenuItem
                          fontSize={"xl"}
                          as={"a"}
                          href={`${nearConfig.explorerUrl}/accounts/${accountId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          My Wallet
                        </MenuItem>
                        <MenuItem
                          fontSize={"xl"}
                          onClick={() => handleSignOut()}
                        >
                          Disconnect
                        </MenuItem>
                      </>
                    )}
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
