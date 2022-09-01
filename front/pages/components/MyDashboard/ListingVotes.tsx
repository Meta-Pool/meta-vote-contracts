import {
  useDisclosure, 
  Heading,
  Flex,
  Center,
  Button,
  Link,
  VStack,
  useToast
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getNearConfig, getVotesByVoter, unvoteProject } from '../../../lib/near';
import { useStore as useVoter } from "../../../stores/voter";
import VoteCard from './VoteCard';
import InfoModal from './InfoModal';
import { CONTRACT_ADDRESS, MODAL_TEXT } from '../../../constants';
import { useWalletSelector } from '../../../contexts/WalletSelectorContext';
import { colors } from '../../../constants/colors';
import { Stack } from 'phosphor-react';


const ListingVotes = () => {
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfo} = useDisclosure();

  const { voterData, setVoterData } = useVoter();
  const [ positionSelected, setPositionSel ] = useState('')
  const { selector } = useWalletSelector();
  const [ procesingFlag, setProcessFlag] = useState(false); 

  const toast = useToast();

  const contract = CONTRACT_ADDRESS ? CONTRACT_ADDRESS : '';

  const getVotes = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingResults = await getVotesByVoter();
    setVoterData(newVoterData);
  }

  const unvote = (id: any)=> {
      try {
        setProcessFlag(true);
        infoOnClose();
        unvoteProject(id, contract).then(()=>{
          getVotes();
          toast({
            title: "Unvote success.",
            status: "success",
            duration: 3000,
            position: "top-right",
            isClosable: true,
          });
          setTimeout(()=>{
            getVotes();
            setProcessFlag(false);
          }, 2000)
        }).catch(()=>
        {
          toast({
            title: "Transaction error.",
            status: "error",
            duration: 3000,
            position: "top-right",
            isClosable: true,
          });
          setProcessFlag(false);
        });
      } catch (error) {
        setProcessFlag(false);
        infoOnClose();
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
                  <VStack  spacing={10} alignItems={'flex-start'} justify={'flex-start'}  w={'100%'}>
                    <Heading fontSize={'2xl'} > You didn’t vote anything yet.</Heading>
                    <Button  borderRadius={100}  fontSize={{ base: "md", md: "md" }}   colorScheme={colors.primary}>
                      <Link href={getNearConfig().metayieldUrl} isExternal>Browser projects at MetaYield</Link>
                    </Button>
                  </VStack>
                )
              }
          </Flex>
        }

      <InfoModal content={{title :MODAL_TEXT.VOTE.title, text:MODAL_TEXT.VOTE.text}}  isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={() => unvote(positionSelected)} ></InfoModal>
    </section>
  );
};

export default ListingVotes;
 