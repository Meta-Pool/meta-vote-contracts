import {
  Button,
  Flex,
  Text,
  useDisclosure,
  VStack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tag,
  Square,
  Image,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Circle,
  useBreakpointValue,
  Heading,
  Box,
  Stack,
  Tooltip,
  Link,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { colors } from "../../../constants/colors";
import {
  getAllLockingPositions,
  getAvailableVotingPower,
  getBalanceMetaVote,
  getInUseVotingPower,
  getLockedBalance,
  getNearConfig,
  getUnlockingBalance,
  relock,
  unlock,
  withdrawAPosition,
} from "../../../lib/near";
import { useStore as useVoter } from "../../../stores/voter";
import { ntoy, yton } from "../../../lib/util";
import LockModal from "./LockModal";
import InfoModal, { InfoContent } from "./InfoModal";
import {
  ACTION_TYPE,
  GET_META_ENABLED,
  MODAL_DURATION,
  MODAL_TEXT,
} from "../../../constants";

import ButtonOnLogin from "../ButtonLogin";
import VPositionCard from "./VPositionCard";
import { AddIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useWalletSelector } from "../../../contexts/WalletSelectorContext";
import TxErrorHandler from "../TxErrorHandler";
import { FinalExecutionOutcome } from "near-api-js/lib/providers";
import ErrorModal from "./ErrorModal";
import { useRouter } from "next/router";

type Props = {};

const LockingPosition = (props: Props) => {
  const router = useRouter();
  const { voterData, setVoterData } = useVoter();
  const [actionCall, setActionCall] = useState(() => () => {});
  const [procesingFlag, setProcessFlag] = useState(false);

  const [modalContent, setModalContent] = useState<InfoContent>({
    title: "",
    text: "",
  });
  const [modalContentError, setModalContentError] = useState<InfoContent>({
    title: "",
    text: "",
  });

  const { selector } = useWalletSelector();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const {
    isOpen: infoIsOpen,
    onClose: infoOnClose,
    onOpen: onOpenInfoModal,
  } = useDisclosure();
  const {
    isOpen: errorIsOpen,
    onClose: errorOnClose,
    onOpen: onOpenErrorModal,
  } = useDisclosure();

  const [finalExecutionOutcome, setFinalExecutionOutcome] =
    useState<FinalExecutionOutcome | null>(null);
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const toast = useToast();

  const getVotingPositions = async () => {
    const newVoterData = voterData;
    newVoterData.lockingPositions = voterData.lockingPositions;
    setVoterData(newVoterData);
    newVoterData.lockingPositions = await getAllLockingPositions();
    setVoterData(newVoterData);
    setProcessFlag(false);
  };

  const refreshHeaderData = async () => {
    const newVoterData = voterData;
    newVoterData.votingPower = await getAvailableVotingPower();
    newVoterData.inUseVPower = await getInUseVotingPower();
    newVoterData.metaLocked = await getLockedBalance();
    newVoterData.metaToWithdraw = await getBalanceMetaVote();
    newVoterData.metaUnlocking = await getUnlockingBalance();
    setVoterData(newVoterData);
  };

  const waitingTime = 2000;

  const unlockPosition = (idPosition: string) => {
    try {
      setProcessFlag(true);
      unlock(idPosition)
        .then((result) => {
          // After the action I need to wait some async time to give the contract time to update the data.
          // Withoud the setTiemout the get is not retrieving the updated data
          setTimeout(() => {
            getVotingPositions();
            refreshHeaderData();
          }, waitingTime);
          setFinalExecutionOutcome(result);
        })
        .catch((error) => {
          console.log("error on catch", error);
          toast({
            title: "Transaction error.",
            description: error,
            status: "error",
            duration: MODAL_DURATION.ERROR,
            position: "top-right",
            isClosable: true,
          });
          setProcessFlag(false);
        });
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
  };

  const withdrawCall = (positionId: string) => {
    try {
      setProcessFlag(true);
      withdrawAPosition(positionId)
        .then(() => {
          setTimeout(() => {
            getVotingPositions();
            refreshHeaderData();
            toast({
              title: "Successful withdrawal.",
              status: "success",
              duration: MODAL_DURATION.SUCCESS,
              position: "top-right",
              isClosable: true,
            });
          }, waitingTime);
        })
        .catch((error) => {
          console.log("error on catch", error);
          toast({
            title: "Transaction error.",
            description: error,
            status: "error",
            duration: MODAL_DURATION.ERROR,
            position: "top-right",
            isClosable: true,
          });
          setProcessFlag(false);
        });
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
  };

  const relockClicked = (
    positionIndex: string,
    period: string,
    amount: string
  ) => {
    try {
      setProcessFlag(true);
      relock(positionIndex, period, amount)
        .then(() => {
          setTimeout(() => {
            getVotingPositions();
            refreshHeaderData();
          }, waitingTime);
        })
        .catch((error) => {
          console.log("error on catch", error);
          toast({
            title: "Transaction error.",
            description: error,
            status: "error",
            duration: MODAL_DURATION.ERROR,
            position: "top-right",
            isClosable: true,
          });
          setProcessFlag(false);
        });
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
  };

  const clickedAction = (
    idPosition: string,
    type: ACTION_TYPE,
    positionVPower: any,
    period?: string,
    amount?: string
  ) => {
    switch (type) {
      case ACTION_TYPE.UNLOCK:
        if (yton(voterData.votingPower) < positionVPower) {
          const content = {
            title: MODAL_TEXT.UNLOCK.ERROR_NOT_ENOUGH.title,
            text: MODAL_TEXT.UNLOCK.ERROR_NOT_ENOUGH.text
              .replace(":positionAmount", positionVPower)
              .replace(
                ":votingPowerAvailable",
                yton(voterData.votingPower).toString()
              ),
          };
          setModalContentError(content);
          onOpenErrorModal();
        } else {
          setModalContent(MODAL_TEXT.UNLOCK.CONFIRM);
          setActionCall(() => () => unlockPosition(idPosition));
          onOpenInfoModal();
          break;
        }
      case ACTION_TYPE.RELOCK:
        if (period && amount) {
          setModalContent(MODAL_TEXT.RELOCK);
          setActionCall(() => () => relockClicked(idPosition, period, amount));
          onOpenInfoModal();
        }
        break;
      case ACTION_TYPE.WITHDRAW:
        setModalContent(MODAL_TEXT.WITHDRAW);
        setActionCall(() => () => withdrawCall(idPosition));
        onOpenInfoModal();
        break;
    }
  };

  useEffect(() => {
    (async () => {
      if (selector && selector.isSignedIn()) {
        getVotingPositions();
      }
    })();
  }, [selector]);

  return (
    <section>
      <TxErrorHandler finalExecutionOutcome={finalExecutionOutcome} />
      {voterData.lockingPositions.length === 0 ? (
        <Stack
          minH={400}
          spacing={10}
          direction="column"
          alignItems={"flex-start"}
          justify={{ base: "center", md: "flex-start" }}
        >
          <Heading fontSize={"2xl"}>
            To get voting power, you need to lock $META.
          </Heading>
          <ButtonOnLogin>
            <HStack spacing={5}>
              <Button
                leftIcon={<AddIcon />}
                borderRadius={100}
                fontSize={{ base: "md", md: "md" }}
                onClick={onOpen}
                colorScheme={colors.primary}
              >
                Add Voting Power
              </Button>
              {GET_META_ENABLED ? (
                <Button
                  borderRadius={100}
                  fontSize={{ base: "md", md: "md" }}
                  variant={"outline"}
                  colorScheme={colors.primary}
                  onClick={() => router.push("/get-meta")}
                >
                  Get more $META
                </Button>
              ) : (
                <Button
                  borderRadius={100}
                  rightIcon={<ExternalLinkIcon />}
                  fontSize={{ base: "md", md: "md" }}
                  variant={"outline"}
                  colorScheme={colors.primary}
                >
                  <Link
                    fontWeight={500}
                    href={getNearConfig()?.refFinance}
                    isExternal
                  >
                    Get more $META
                  </Link>
                </Button>
              )}
            </HStack>
          </ButtonOnLogin>
        </Stack>
      ) : (
        <Flex flexWrap={"wrap"} justifyContent={"space-between"}>
          {voterData.lockingPositions.map((position: any, index: number) => {
            return (
              <VPositionCard
                key={index}
                availableVPower={voterData.votingPower}
                position={position}
                vPower={yton(position.voting_power).toFixed(4)}
                amount={yton(position.amount).toFixed(4)}
                period={position.locking_period}
                clickedAction={clickedAction}
                procesing={procesingFlag}
              />
            );
          })}

          <Tooltip hidden={!isDesktop} label="Lock $META to get Voting Power">
            <Stack
              hidden={!isDesktop}
              onClick={onOpen}
              _hover={{ border: "3px solid lightgray", cursor: "pointer" }}
              border={"2px solid #E5E5E5"}
              borderRadius={"30px"}
              bg={"#F9F9FA"}
              px={"20px"}
              py={"38px"}
              m={"11px"}
              justify={"center"}
              align={"center"}
              minH={"176px"}
              h={"176px"}
              minW={"330px"}
            >
              <AddIcon fontSize={"40px"} color={"lightgray"}></AddIcon>
            </Stack>
          </Tooltip>
        </Flex>
      )}
      <ErrorModal
        content={modalContentError}
        isOpen={errorIsOpen}
        onClose={errorOnClose}
      ></ErrorModal>
      <InfoModal
        content={modalContent}
        isOpen={infoIsOpen}
        onClose={infoOnClose}
        onSubmit={actionCall}
      ></InfoModal>
      <LockModal isOpen={isOpen} onClose={onClose}></LockModal>
    </section>
  );
};

export default LockingPosition;
