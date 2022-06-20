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
import { getVotesByVoter, unvoteProject } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import LockModal from './LockModal';
import { yton } from '../../../lib/util';

type Props = {
}

const ListingVotes = (props: Props) => {
  const { wallet} = useWallet();
  const { isOpen,  onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();


  const getVotes = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingResults = await getVotesByVoter(wallet);
    setVoterData(newVoterData);
  }

  const unvoteClicked = (idVote: string)=> {
      try {
        const contract = 'metayield-proyect';
        unvoteProject(idVote, contract, wallet);
      } catch (error) {
        console.error(error);
      }
  }

  useEffect(  () =>{
    (async ()=> {
      if (wallet && wallet.isSignedIn()) {
        getVotes()
      }
    })();
  },[wallet])


  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          
          {/*<Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Votes List</Heading> 
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
            </Button>*/}
        </Flex>
        <TableContainer mt={30}>
          <Table  >
            <Thead>
              <Tr>
                <Th fontSize={'xl'}>ID</Th>
                <Th fontSize={'xl'}>Current Votes</Th>
                <Th fontSize={'xl'} >Contract</Th>
                <Th fontSize={'xl'}>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {  voterData.votingResults.map((position: any, index: number)=> {
                  return (
                    <Tr key={index}>
                      <Td>{position.id} </Td>
                      <Td>{yton(position.current_votes)}</Td>
                      <Td >{position.votable_contract}</Td>
                      <Td>
                          <Button colorScheme={colors.primary} onClick={()=>unvoteClicked(position.id)}>Unvote</Button>
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

export default ListingVotes;
 