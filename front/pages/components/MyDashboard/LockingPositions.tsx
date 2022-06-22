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
  Td,
  Tag,
  Square,
  Image,
  HStack,
  Show,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Circle
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAllLockingPositions, getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance, unlock } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { getLockinPositionStatus, POSITION_STATUS, timeLeftTo, yton } from '../../../lib/util';
import LockModal from './LockModal';
import { AnyNaptrRecord } from 'dns';

type Props = {
  shortVersion?: boolean
}

const LockingPosition = (props: Props) => {
  const { wallet} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();

  const STATUS = ['Locked', 'Unlocked', 'Unloking...']

  const getVotingPositions = async ()=> {
    const newVoterData = voterData;
    newVoterData.lockingPositions = await getAllLockingPositions(wallet);
    setVoterData(newVoterData);
  }

  const unlockClicked = (idPosition: string)=> {
      try {
        unlock(idPosition, wallet);
      } catch (error) {
        console.error(error);
      }
  }

  const getStatusTag = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <Tag colorScheme={'red'} variant='solid'>{STATUS[getLockinPositionStatus(position)]}</Tag> )

      case POSITION_STATUS.UNLOCKED:
        return ( <Tag colorScheme={'green'} variant='solid'>{STATUS[getLockinPositionStatus(position)]}</Tag>)

      case POSITION_STATUS.UNLOKING:
        return ( <Tag colorScheme={'yellow'} variant='solid'>{STATUS[getLockinPositionStatus(position)]}</Tag> ) 
    }
  }

  const getStatusCircle = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <><Circle mr={5} size={3} bg={'green'}/>{STATUS[getLockinPositionStatus(position)]}</> )

      case POSITION_STATUS.UNLOCKED:
        return ( <><Circle mr={5} size={3} bg={'red'}/>{STATUS[getLockinPositionStatus(position)]}</>)

      case POSITION_STATUS.UNLOKING:
        return (<><Circle mr={5} size={3} bg={'orange'}/>{STATUS[getLockinPositionStatus(position)]}</> ) 
    }
  }

  const getButtonbyStatus = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <Button colorScheme={colors.primary}  w={'100%'} onClick={()=> unlockClicked(position.index)}>Start unlock</Button> )

      case POSITION_STATUS.UNLOCKED:
        return ( <Button colorScheme={colors.primary} w={'100%'}>Withdraw</Button>)

      case POSITION_STATUS.UNLOKING:
        return ( <Button colorScheme={colors.primary} w={'100%'}>Relock</Button> ) 
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
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          
          {/*<Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Locking Positions</Heading>
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
            </Button>*/}
        </Flex>
        <Show above={'md'}>
          <TableContainer mt={30}>
            <Table  >
              <Thead>
                <Tr>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'} isNumeric>Voting Power</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'}isNumeric >$META amount</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'} isNumeric>Autolock days</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'}>Status</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'}>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {  voterData.lockingPositions.map((position: any, index: number)=> {
                    return (
                      <Tr key={index}>
                        <Td  fontSize={'2xl'} isNumeric>{yton(position.voting_power).toFixed(4)}</Td>
                        <Td  fontSize={'2xl'} isNumeric> 
                          <HStack justify={'end'}>
                            <Text>{yton(position.amount).toFixed(4)}</Text> 
                            <Square minW="30px">
                              <Image
                                boxSize="20px"
                                objectFit="cover"
                                src="/meta.svg"
                                alt="stnear"
                              />
                            </Square>
                          </HStack>
                        </Td>
                        <Td fontSize={'2xl'} isNumeric >{position.locking_period} days</Td>
                        <Td fontSize={'2xl'} > 
                          <HStack>{ getStatusCircle(position) } </HStack>
                        </Td>
                        <Td>
                          { getButtonbyStatus(position)}
                        </Td>
                      </Tr>
                    )
                })}
              </Tbody>
            </Table>
          </TableContainer>
        </Show>
        <Show below='md'>

        {  voterData.lockingPositions.map((position: any, index: number)=> {
                    return (
                        <Accordion  key={index} allowMultiple>
                          <AccordionItem m={2} >
                            <AccordionButton  _expanded={{bg:'white'}}  bg={{base: 'white'}}>
                              <HStack w={'100%'} justify={'space-between'} textAlign="left">
                                <HStack><Circle size={3} bg={'red'}></Circle>
                                <Text fontSize={'xl'}>{position.locking_period} days </Text></HStack>
                                <Text  bg={colors.secundary+".50"} p={2} fontSize={'xl'}>{yton(position.voting_power).toFixed(4)} </Text>
                              </HStack>
                              <AccordionIcon ml={5} fontSize={'2xl'} />
                            </AccordionButton>
                            <AccordionPanel pb={4}>
                              <VStack >
                                <HStack w={'100%'} justify={'space-between'}> 
                                  <Text fontSize={'xl'}>$META amount:</Text>
                                  <Text p={2} bg={colors.secundary+".50"} fontSize={'xl'}> {yton(position.amount).toFixed(4)}</Text>
                                </HStack>
                                <HStack w={'100%'} justify={'space-between'}> 
                                  <Text fontSize={'xl'}>Voting Power:</Text>
                                  <Text p={2} bg={colors.secundary+".50"} fontSize={'xl'}> {yton(position.voting_power).toFixed(4)}</Text>
                                </HStack>
                                <HStack w={'100%'} justify={'space-between'}> 
                                  <Text fontSize={'xl'}>Autolock days</Text>
                                  <Text p={2} bg={colors.secundary+".50"} fontSize={'xl'}> {position.locking_period} Days</Text>
                                </HStack>
                                <HStack  w={'100%'} justify={'space-between'}> 
                                  <Text fontSize={'xl'}>Status:</Text>
                                  <Text p={2} fontSize={'xl'}> {getStatusTag(position)}</Text>
                                </HStack>
                                { getButtonbyStatus(position)}

                              </VStack>
                            </AccordionPanel>
                          </AccordionItem>
                        </Accordion>
                    );
                })
          }
          
        </Show>
        
      <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>
    </section>
  );
};

export default LockingPosition;
 