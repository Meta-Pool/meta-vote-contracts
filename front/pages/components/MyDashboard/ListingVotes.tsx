import {
  Button, 
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
  Heading,
  Text,
  useBreakpointValue,
  Flex
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getVotesByVoter, unvoteProject } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { yton } from '../../../lib/util';
import InfoModal from './InfoModal';
import { CONTRACT_ADDRESS, MODAL_TEXT } from '../../../constants';


const ListingVotes = () => {
  const { wallet} = useWallet();
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfo} = useDisclosure();

  const { voterData, setVoterData } = useVoter();
  const [ positionSelected, setPositionSel ] = useState('')
  const isDesktop = useBreakpointValue({ base: false, md: true });


  const contract = CONTRACT_ADDRESS ? CONTRACT_ADDRESS : '';

  const getVotes = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingResults = await getVotesByVoter(wallet);
    setVoterData(newVoterData);
  }

  const unvote = (id: any)=> {
      try {
        unvoteProject(id, contract, wallet);
      } catch (error) {
        console.error(error);
      }
  }

  const unvotedClicked = (voteId: string) => {
    setPositionSel(voteId);
    onOpenInfo();
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
        { /* *********** DESKTOP UI ***************** */
          isDesktop && (
          <TableContainer minH={400} mt={30}>
            <Table position={'relative'} >
              {
                voterData.votingResults && voterData.votingResults.length > 0 && (
                <Thead>
                  <Tr>
                    <Th color={'blackAlpha.500'} fontSize={'2xl'} isNumeric>Voting Power</Th>
                    <Th color={'blackAlpha.500'} fontSize={'2xl'} >Platform</Th>
                    <Th color={'blackAlpha.500'} fontSize={'2xl'}>Project</Th>
                    <Th color={'blackAlpha.500'} fontSize={'2xl'}>Actions</Th>
                  </Tr>
                </Thead>
                )
              }

              <Tbody>
                {  voterData.votingResults.map((position: any, index: number)=> {
                    return (
                      <Tr key={index}>
                        <Td fontSize={'2xl'} isNumeric>{yton(position.current_votes).toFixed(4)}</Td>
                        <Td fontSize={'2xl'} >{position.votable_contract}</Td>
                        <Td fontSize={'2xl'}>{position.id} </Td>
                        <Td fontSize={'2xl'}>
                            <Button colorScheme={colors.primary} w={'100%'} onClick={()=> unvotedClicked(position.id)}>Unvote</Button>
                        </Td>
                      </Tr>
                    )
                })}
              </Tbody>
              {
                voterData.votingResults.length === 0 && (
                  <Flex minH={400}>
                    <Heading fontSize={'2xl'} m={'auto'}> 😕 No votes!</Heading>
                  </Flex>
                )
              }
            </Table>
          </TableContainer>
          )
        }

        { /* *********** MOBILE UI ***************** */
          !isDesktop && (
          <>
            {
                voterData.votingResults.length === 0 && (
                  <Flex minH={400}>
                    <Heading fontSize={'2xl'} m={'auto'}> 😕 No votes!</Heading>
                  </Flex>
                )
              }
            {  voterData.votingResults.map((position: any, index: number)=> {
                  return (
                    <Accordion  key={index} allowMultiple>
                      <AccordionItem m={2}>
                        <AccordionButton _expanded={{bg:'white'}} bg={{base: 'white'}}>
                          <HStack w={'100%'} justify={'space-between'} textAlign="left">
                            <Text fontSize={'xl'}> {position.id}</Text>
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
                            <Button w={'100%'} colorScheme={colors.primary} onClick={()=> unvotedClicked(position.id)}>Unvote</Button>
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
      <InfoModal content={{title :MODAL_TEXT.VOTE.title, text:MODAL_TEXT.VOTE.text}}  isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={() => unvote(positionSelected)} ></InfoModal>
    </section>
  );
};

export default ListingVotes;
 