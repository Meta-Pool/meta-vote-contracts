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
  toast,
  TableContainer,
  Table,
  TableCaption,
  Thead,
  Tr,
  Th,
  Tbody,
  Td
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAllLockingPositions, getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance, unlock } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { getLockinPositionStatus, POSITION_STATUS, yton } from '../../../lib/util';
import LockModal from './LockModal';
import { AnyNaptrRecord } from 'dns';

type Props = {
  shortVersion?: boolean
}

const LockingPosition = (props: Props) => {
  const { wallet} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();

  const STATUS = ['Locked', 'Unlocked', 'Unloking']

  const getVotingPositions = async ()=> {
    const newVoterData = voterData;
    newVoterData.lockingPositions = await getAllLockingPositions(wallet);
    setVoterData(newVoterData);
  }

  const unlockClicked = (idPosition: string)=> {
      console.log("id", idPosition)
      try {
        unlock(idPosition, wallet);
      } catch (error) {
        console.error(error);
      }
  }

  useEffect(  () =>{
    (async ()=> {
      if (wallet && wallet.isSignedIn()) {
        getVotingPositions()
      }
    })();
  },[wallet])


  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          
          {/*<Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Locking Positions</Heading>
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
            </Button>*/}
        </Flex>
        <TableContainer mt={30}>
          <Table  >
            <Thead>
              <Tr>
                <Th fontSize={'xl'}>Position</Th>
                <Th fontSize={'xl'}>Period</Th>
                <Th fontSize={'xl'} isNumeric>Votinpower</Th>
                <Th fontSize={'xl'} isNumeric>Amount</Th>
                <Th fontSize={'xl'}>Status</Th>
                <Th fontSize={'xl'}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {  voterData.lockingPositions.map((position: any, index: number)=> {
                  return (
                    <Tr key={index}>
                      <Td>{position.index} </Td>
                      <Td>{position.locking_period} Days</Td>
                      <Td isNumeric>{yton(position.voting_power)}</Td>
                      <Td isNumeric>{yton(position.amount)} $META</Td>
                      <Td>{STATUS[getLockinPositionStatus(position)]}</Td>
                      <Td>
                        {
                           getLockinPositionStatus(position) === POSITION_STATUS.LOCKED && (
                              <Button colorScheme={colors.primary}  onClick={()=> unlockClicked(position.index)}>Start unlock</Button>
                           )
                        }
                        {
                           getLockinPositionStatus(position) === POSITION_STATUS.UNLOCKED && (
                              <Button colorScheme={colors.primary}>Withdraw</Button>
                           )
                        }
                      </Td>
                    </Tr>
                  )
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Container>
      <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>
    </section>
  );
};

export default LockingPosition;
 