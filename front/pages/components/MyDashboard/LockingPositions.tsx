import {
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  useDisclosure, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  VStack,
  StackDivider,
  toast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAllLockingPositions, getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { yton } from '../../../lib/util';
import LockModal from './LockModal';
import { AnyNaptrRecord } from 'dns';

type Props = {
  shortVersion?: boolean
}

const LockingPosition = (props: Props) => {
  const { wallet, isLogin} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();

  const getVotingPositions = async ()=> {
    const newVoterData = voterData;
    newVoterData.lockingPositions = await getAllLockingPositions(wallet);
    setVoterData(newVoterData);
  }

  useEffect(  () =>{
    (async ()=> {
      if (isLogin && wallet) {
        // getVotingPositions()
      }
    })();
  },[wallet, isLogin])


  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'3xl'}> Locking Positions</Heading>
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
          </Button>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          {  voterData.lockingPositions.map((position: AnyNaptrRecord, index: number)=> {
              return (
                <Text key={index}>Position</Text>
              )
          })}
        </Flex>
      </Container>
      <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>

    </section>
  );
};

export default LockingPosition;
 