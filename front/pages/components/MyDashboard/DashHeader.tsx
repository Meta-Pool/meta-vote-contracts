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
import { getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { yton } from '../../../lib/util';
import LockModal from './LockModal';

type Props = {
  shortVersion?: boolean
}

const DashboardHeader = (props: Props) => {
  const { wallet, isLogin} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();

  const initMyData = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingPower = await getAvailableVotingPower(wallet);
    newVoterData.inUseVPower = await getInUseVotingPower(wallet);
    newVoterData.metaLocked = await getLockedBalance(wallet);
    newVoterData.metaUnlocking = await getUnlockingBalance(wallet);
    newVoterData.projectsVoted = await getBalanceMetaVote(wallet); 
    setVoterData(newVoterData);
  }

  useEffect(  () =>{
    (async ()=> {
      if (isLogin && wallet) {
        initMyData()
      }
    })();
  },[wallet, isLogin])


  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'3xl'}> Welcome {wallet && wallet.getAccountId()} </Heading>
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
          </Button>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>My Voting Power</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{yton(voterData.votingPower)}</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>In use</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{voterData.inUseVPower}</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary} >
            <Text fontSize={'xl'}>Projects Finished</Text>
            <Text fontSize={'4xl'}>{voterData.projectsFinished}</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary}>
            <Text fontSize={'xl'}>Projects you voted</Text>
            <Text fontSize={'4xl'}>{voterData.projectsVoted}</Text>
          </Box>
        </Flex>
        <Flex mt={10} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>$META Locked</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{yton(voterData.metaLocked)}</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>$META Unlocking</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{yton(voterData.metaUnlocking)}</Text>
          </Box>
          <Box>
            <Text fontSize={'xl'}>$META to Withdraw</Text>
            <Text fontSize={'4xl'}>{yton(voterData.metaToWithdraw)}</Text>
            <Button  w={300} onClick={()=> initMyData()} colorScheme={colors.primary}>
              Withdraw
            </Button>
          </Box>
        </Flex>
      </Container>
      <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>

    </section>
  );
};

export default DashboardHeader;
 