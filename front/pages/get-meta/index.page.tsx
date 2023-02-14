import { ArrowDown, Settings } from "@carbon/icons-react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  useToast,
  Text,
  Stack,
  Button,
  useColorModeValue,
  HStack,
  MenuList,
  MenuItem,
  MenuButton,
  Menu,
  useDisclosure,
  VStack,
  Divider,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useQueryClient } from "react-query";
import {
  GET_META_DEFAULT_SLIPPAGE,
  GET_META_ENABLED,
  GET_META_MIN_SLIPPAGE,
  MODAL_DURATION,
} from "../../constants";
import { colors } from "../../constants/colors";
import {
  useGetWhitelistedTokens,
  useGetMetaContractFee,
} from "../../hooks/getMeta";
import {
  computeMetaAmountOnReturn,
  depositNear,
  depositToken,
  META_CONTRACT_ID,
} from "../../lib/near";
import { formatToLocaleNear, ntoy, yton } from "../../lib/util";
import ButtonOnLogin from "../components/ButtonLogin";
import FeatureComingSoon from "../components/coming-soon";
import PageLoading from "../components/PageLoading";
import DetailInfo from "./DetailInfo";
import SlippageSettingsModal from "./SlippageSettingsModal";
import TokenAmount from "./TokenAmount";
import TokenAmountInUsd from "./TokenAmount/TokenAmountInUsd";
import TokenIcon from "./TokenIcon";
import TokenSymbol from "./TokenIcon/TokenSymbol";
import { isDenominationACurrency, isNearDenomination } from "./TokenIcon/util";

export default function GetMeta() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const { data: tokens, isLoading } = useGetWhitelistedTokens();
  const { data: getMetaFee } = useGetMetaContractFee();
  const [tokenSelected, setTokenSelected] = useState<string | undefined>();
  const [amount, setAmount] = useState<number>(0);
  const [minAmountExpected, setMinAmountExpected] = useState<number>(0);
  const [metaOnReturn, setMetaOnReturn] = useState<number>(0);
  const [metaAmount, setMetaAmount] = useState<number>(0);
  const [metaStNearRate, setMetaStNearRate] = useState<number>(0);
  const [slippage, setSlippage] = useState<number>(GET_META_DEFAULT_SLIPPAGE);
  const [amountError, setAmountError] = useState<string | undefined>(undefined);
  const {
    isOpen: isOpenModal,
    onClose: onCloseModal,
    onOpen: onOpenModal,
  } = useDisclosure();
  const onChangeToken = (tokenContractId: string) => {
    setTokenSelected(tokenContractId);
  };

  useEffect(() => {
    const getMetaAmountToReceive = async () => {
      const result = await computeMetaAmountOnReturn(
        tokenSelected!,
        ntoy(amount)
      );
      const _metaAmount = yton(result);
      setMetaOnReturn(_metaAmount);
      setMetaAmount(_metaAmount);
      const _minAmountExpected = _metaAmount - (_metaAmount * slippage) / 100;
      // min amount would be the meta amount on return - slippage
      setMinAmountExpected(_minAmountExpected);
      setMetaStNearRate(amount / _metaAmount);
    };

    if (tokenSelected && amount > 0) {
      getMetaAmountToReceive();
    } else {
      setMinAmountExpected(0);
    }
  }, [tokenSelected, amount, slippage]);

  const onGetMetaClick = () => {
    if (tokenSelected && amount > 0) {
      console.log(`calling deposit ${tokenSelected} for ${ntoy(amount)}`);
      if (isNearDenomination(tokenSelected)) {
        depositNear(ntoy(amount), ntoy(minAmountExpected))
          .then(() => {
            toast({
              title: "Transaction success.",
              status: "success",
              duration: MODAL_DURATION.LONG,
              position: "top-right",
              isClosable: true,
            });
          })
          .catch((error) => {
            toast({
              title: "Transaction error.",
              description: error,
              status: "error",
              duration: MODAL_DURATION.ERROR,
              position: "top-right",
              isClosable: true,
            });
          });
      } else {
        depositToken(tokenSelected!, ntoy(amount), ntoy(minAmountExpected))
          .then(() => {
            toast({
              title: "Transaction success.",
              status: "success",
              duration: MODAL_DURATION.LONG,
              position: "top-right",
              isClosable: true,
            });
          })
          .catch((error) => {
            toast({
              title: "Transaction error.",
              description: error,
              status: "error",
              duration: MODAL_DURATION.ERROR,
              position: "top-right",
              isClosable: true,
            });
          });
      }
    }
  };

  const onSetSlippage = () => {};
  if (isLoading) return <PageLoading />;
  if (!GET_META_ENABLED) {
    return <FeatureComingSoon />;
  }
  return (
    <>
      <SlippageSettingsModal
        isOpen={isOpenModal}
        onClose={onCloseModal}
        slippage={slippage}
        minSlippage={GET_META_MIN_SLIPPAGE}
        setSlippage={setSlippage}
        onSetSlippageClick={onSetSlippage}
      />
      <VStack
        borderBottomLeftRadius={{ base: "32px", md: "0px" }}
        borderBottomRightRadius={{ base: "32px", md: "0px" }}
        bg={colors.bgGradient}
        h={"100vh"}
        color={"white"}
        spacing={{ base: "10px", md: "30px" }}
        justify={"space-between"}
      >
        <Stack
          borderRadius={"8px"}
          boxShadow={"2xl"}
          padding={{ base: "16px", md: "30px" }}
        >
          <HStack justifyContent="space-between">
            <Text fontFamily="meta" fontSize="xl">
              Get $META
            </Text>
            <VStack align="flex-end" justify="flex-end">
              <Settings size="24" cursor="pointer" onClick={onOpenModal} />
            </VStack>
          </HStack>

          <VStack
            minH={{ base: "70px", md: "130px" }}
            p={5}
            bg="rgba(0, 0, 0, 0.2)"
            borderRadius="8px"
          >
            <HStack
              w="100%"
              spacing={5}
              justify="space-between"
              align="flex-end"
            >
              <Menu placement="bottom-end">
                <MenuButton
                  as={Button}
                  aria-label="Options"
                  rightIcon={<ChevronDownIcon />}
                  variant="outline"
                  rounded={"full"}
                  fontFamily={"meta"}
                  mb={"20px"}
                >
                  {!tokenSelected ? (
                    "Select token"
                  ) : (
                    <TokenIcon denomination={tokenSelected} />
                  )}
                </MenuButton>

                <MenuList
                  rounded="lg"
                  p="8px"
                  lineHeight={10}
                  minW={0}
                  w={{ base: "180px", md: "215px" }}
                >
                  {tokens.map((tokenContractId: string) => {
                    return (
                      <MenuItem
                        rounded="md"
                        key={`token_${tokenContractId}`}
                        color={colors.primary}
                        onClick={() => onChangeToken(tokenContractId)}
                      >
                        <TokenIcon denomination={tokenContractId} />
                      </MenuItem>
                    );
                  })}
                </MenuList>
              </Menu>
              <TokenAmount
                currency={tokenSelected}
                amount={amount}
                setAmount={setAmount}
                setAmountError={setAmountError}
              />
            </HStack>
            <Stack align={"center"}>
                  <ArrowDown />
            </Stack>
           
            <HStack w="100%" spacing={5} justify="space-between">
              <TokenIcon color={colors.white} denomination={META_CONTRACT_ID} />
              <TokenAmount
                currency={META_CONTRACT_ID}
                amount={metaAmount}
                setAmount={setMetaAmount}
                readOnly={true}
                stNearRate={metaStNearRate}
              />
            </HStack>
            {tokenSelected && amount > 0 ? (
              <VStack pt={5} spacing={"3"} w="100%">
                <DetailInfo
                  color={colors.white}
                  fontWeight={"extrabold"}
                  name={`Minimum received after slippage (${slippage}%)`}
                >
                  {`${formatToLocaleNear(minAmountExpected)} $META`}
                </DetailInfo>
                <DetailInfo
                  color={"gray.400"}
                  lineHeight={3}
                  letterSpacing="wide"
                  name={"Rate"}
                >
                  <HStack>
                    <Text>1</Text>
                    <TokenSymbol denomination={tokenSelected} />
                    <Text>
                      ≈ {formatToLocaleNear(metaOnReturn / amount)} $META
                    </Text>
                  </HStack>
                </DetailInfo>
                <DetailInfo
                  color={"gray.400"}
                  lineHeight={3}
                  letterSpacing="wide"
                  name={""}
                >
                  <HStack>
                    <Text>1</Text>
                    <TokenSymbol denomination={META_CONTRACT_ID} />
                    <TokenAmountInUsd
                      currency={META_CONTRACT_ID}
                      amount={1}
                      stNearRate={metaStNearRate}
                    />
                  </HStack>
                </DetailInfo>
              </VStack>
            ) : null}
          </VStack>
          <ButtonOnLogin>
            <Button
              borderRadius={100}
              w={"100%"}
              colorScheme={colors.primary}
              onClick={onGetMetaClick}
              disabled={!!amountError}
            >
              {!amountError ? "Buy" : amountError}
            </Button>
          </ButtonOnLogin>
        </Stack>
      </VStack>
    </>
  );
}
