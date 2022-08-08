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
  Flex,
  Link,
  Center
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getVotesByVoter, unvoteProject } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { yton } from '../../../lib/util';
import VoteCard from './VoteCard';
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
        { 
          <Flex>
              {  
                  voterData.votingResults.length > 0 && voterData.votingResults.map((position: any, index: number)=> {
                    return (
                      <VoteCard 
                          key={index}
                          position={position}
                          unvoteAction={()=>{unvotedClicked(position.id)}}/>
                )})
              }      
              {
                voterData.votingResults.length === 0 && (
                  <Center w={'100%'}>
                    <Heading fontSize={'2xl'} m={'auto'}> 😕 No votes!</Heading>
                  </Center>
                )
              }
          </Flex>
        }

      <InfoModal content={{title :MODAL_TEXT.VOTE.title, text:MODAL_TEXT.VOTE.text}}  isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={() => unvote(positionSelected)} ></InfoModal>
    </section>
  );
};

export default ListingVotes;
 