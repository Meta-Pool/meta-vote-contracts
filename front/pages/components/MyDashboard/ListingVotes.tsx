import {
  useDisclosure, 
  Heading,
  Flex,
  Center
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getVotesByVoter, unvoteProject } from '../../../lib/near';
import { useStore as useVoter } from "../../../stores/voter";
import VoteCard from './VoteCard';
import InfoModal from './InfoModal';
import { CONTRACT_ADDRESS, MODAL_TEXT } from '../../../constants';
import { useWalletSelector } from '../../../contexts/WalletSelectorContext';


const ListingVotes = () => {
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfo} = useDisclosure();

  const { voterData, setVoterData } = useVoter();
  const [ positionSelected, setPositionSel ] = useState('')
  const { selector } = useWalletSelector();
  const [ procesingFlag, setProcessFlag] = useState(false); 


  const contract = CONTRACT_ADDRESS ? CONTRACT_ADDRESS : '';

  const getVotes = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingResults = await getVotesByVoter();
    setVoterData(newVoterData);
  }

  const unvote = (id: any)=> {
      try {
        setProcessFlag(true);
        unvoteProject(id, contract).then(()=>{
          getVotes();
          setProcessFlag(false);
        });
      } catch (error) {
        setProcessFlag(false);
        console.error(error);
      }
  }

  const unvotedClicked = (voteId: string) => {
    setPositionSel(voteId);
    onOpenInfo();
  }

  useEffect(  () =>{
    (async ()=> {
      if (selector && selector.isSignedIn()) {
        getVotes();
      }
    })();
  },[selector])

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
                          procesing={procesingFlag}
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
 