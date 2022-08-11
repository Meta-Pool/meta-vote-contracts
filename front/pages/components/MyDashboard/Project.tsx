import {
  Box, 
  Button, 
  Text, 
  Badge,
  useDisclosure
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getVotes } from '../../../lib/near';

import { yton } from '../../../lib/util';
import { useStore as useWallet } from "../../../stores/wallet";
import { useWalletSelector } from '../../contexts/WalletSelectorContext';
import VoteModal from './VoteModal';

type Props = {
  project: any
}

// ATENTION: This component is just for testing propouse.

const Project = (props: Props) => {
  const { project } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { wallet }= useWallet();
  const [ votes, setVotes] =useState('0')
  const { selector, modal, accounts, accountId } = useWalletSelector();

  useEffect( ()=>{ ( async()=>{
    if(selector?.isSignedIn() && project) {
      const myVotes1 = await getVotes(project.id, project.contract)
      setVotes(myVotes1);
    }
  } )()
  },[wallet, project])

  if (!project) {
    return (<></>);
  }

  return (
        <Box key={project.id} w={'30%'} border={'1px'} borderColor={colors.primary} p={10}>
          <Text fontSize={'2xl'}>{project.title} - <Badge>Votes: {yton(votes)}</Badge></Text>
          <Text fontSize={'lg'} color={colors.primary} mt={5}>
            {project.desc}
          </Text>
          <Button mt={10} w={300} colorScheme={colors.primary} onClick={()=> onOpen()}>
            Vote
          </Button>
          <VoteModal id={project.id} isOpen={isOpen} onClose={onClose} wallet={wallet} contractAdress={project.contract}></VoteModal>
        </Box>
  );
};

export default Project;
