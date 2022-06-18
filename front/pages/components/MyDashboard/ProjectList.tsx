import {
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  LinkOverlay, 
  Text, 
  Badge
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getVotes, voteProject } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";

type Props = {
  shortVersion?: boolean
}

const ProjectList = (props: Props) => {
  const { wallet }= useWallet();
  const vote = (id: string)=> {
    const contract = 'metayield-proyect';
    voteProject(id, contract, '1', wallet);
  }

  const [votes1, setVotes1] = useState()
  const [votes2, setVotes2] = useState()
  const [votes3, setVotes3] = useState()

  useEffect( ()=>{ ( async()=>{
    if(wallet && wallet?.isSignedIn()) {
      const myVotes1 = await getVotes("1", "metayield-proyect")
      setVotes1(myVotes1);
      const myVotes2 = await getVotes("2", "metayield-proyect")
      setVotes2(myVotes2);
      const myVotes3 = await getVotes("3", "metayield-proyect")
      setVotes3(myVotes3); 
    }
  } )()
  },[wallet])


  return (
    <section>
      <Container mt={100} id="project-list">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'row', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Project List </Heading>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box w={'30%'} border={'1px'} borderColor={colors.primary} p={10}>
            <Text fontSize={'2xl'}>Project Demo 1 - <Badge>Votes: {votes1}</Badge></Text>
            <Text fontSize={'lg'} color={colors.primary} mt={5}>
                Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure
            </Text>
            <Button mt={10} w={300} colorScheme={colors.primary} onClick={()=> vote('1')}>
              Vote
            </Button>
          </Box>
          <Box w={'30%'} border={'1px'} borderColor={colors.primary} p={10}>
            <Text fontSize={'2xl'}>Project Demo 2 - <Badge>Votes: {votes2}</Badge></Text>
            <Text fontSize={'lg'} color={colors.primary} mt={5}>
                Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure
            </Text>
            <Button mt={10} w={300} colorScheme={colors.primary} onClick={()=> vote('2')}>
              Vote
            </Button>
          </Box>
          <Box w={'30%'} border={'1px'} borderColor={colors.primary} p={10}>
            <Text fontSize={'2xl'}>Project Demo 3 - <Badge>Votes: {votes3}</Badge></Text>
            <Text fontSize={'lg'} color={colors.primary} mt={5}>
                Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure
            </Text>
            <Button mt={10} w={300} colorScheme={colors.primary} onClick={()=> vote('3')}>
              Vote
            </Button>
          </Box>
        </Flex>
      </Container>
    </section>
  );
};

export default ProjectList;
