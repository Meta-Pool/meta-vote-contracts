import {
  Button, 
  Flex, 
  useDisclosure, 
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Accordion,
  AccordionItem,
  AccordionButton,
  HStack,
  Circle,
  VStack,
  AccordionIcon,
  AccordionPanel,
  Text,
  useBreakpointValue
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
  const isDesktop = useBreakpointValue({ base: false, md: true });

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
        getVotes();
      }
    })();
  },[wallet])


  return (
    <section>
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          
          {/*<Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Votes List</Heading> 
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
            </Button>*/}
        </Flex>

        { /* *********** DESKTOP UI ***************** */
          isDesktop && (
          <TableContainer mt={30}>
            <Table  >
              <Thead>
                <Tr>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'} isNumeric>Voting Power</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'} >Platform</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'}>Project</Th>
                  <Th color={'blackAlpha.500'} fontSize={'2xl'}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {  voterData.votingResults.map((position: any, index: number)=> {
                    return (
                      <Tr key={index}>
                        <Td fontSize={'2xl'} isNumeric>{yton(position.current_votes).toFixed(4)}</Td>
                        <Td fontSize={'2xl'} >{position.votable_contract}</Td>
                        <Td fontSize={'2xl'}>{position.id} </Td>
                        <Td fontSize={'2xl'}>
                            <Button colorScheme={colors.primary} w={'100%'} onClick={()=>unvoteClicked(position.id)}>Unvote</Button>
                        </Td>
                      </Tr>
                    )
                })}
              </Tbody>
            </Table>
          </TableContainer>
          )
        }

        { /* *********** MOBILE UI ***************** */
          !isDesktop && (
          <>
            {  voterData.votingResults.map((position: any, index: number)=> {
                  return (
                    <Accordion  key={index} allowMultiple>
                      <AccordionItem m={2}>
                        <AccordionButton _expanded={{bg:'white'}} bg={{base: 'white'}}>
                          <HStack w={'100%'} justify={'space-between'} textAlign="left">
                            <HStack><Circle size={3} bg={'red'}></Circle>
                            <Text fontSize={'xl'}> {position.id}</Text></HStack>
                            <Text  bg={colors.secundary+".50"} p={2} fontSize={'xl'}>{yton(position.current_votes).toFixed(4)} </Text>
                          </HStack>
                          <AccordionIcon ml={5} fontSize={'2xl'} />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <VStack >
                            <HStack w={'100%'} justify={'space-between'}> 
                              <Text fontSize={'xl'}>Voting Power:</Text>
                              <Text bg={colors.secundary+".50"} fontSize={'xl'}> {yton(position.current_votes).toFixed(4)}</Text>
                            </HStack>
                            <HStack w={'100%'} justify={'space-between'}> 
                              <Text fontSize={'xl'}>Platform:</Text>
                              <Text fontSize={'xl'}> {position.votable_contract}</Text>
                            </HStack>
                            <HStack w={'100%'} justify={'space-between'}> 
                              <Text fontSize={'xl'}>Project:</Text>
                              <Text fontSize={'xl'}> {position.id}</Text>
                            </HStack>
                            <Button w={'100%'} colorScheme={colors.primary} onClick={()=>unvoteClicked(position.id)}>Unvote</Button>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )
              })
            }
          </>
          )
        }
     
      <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>
    </section>
  );
};

export default ListingVotes;
 