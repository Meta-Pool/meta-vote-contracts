import {
  Container, 
  Flex, 
  Heading, 
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { getVotes } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useWalletSelector } from '../../contexts/WalletSelectorContext';
import Project from './Project';

type Props = {
  shortVersion?: boolean
}

// ATENTION: This component is just for testing propouse.

const ProjectList = (props: Props) => {
  const { wallet }= useWallet();
  const { selector, modal, accounts, accountId } = useWalletSelector();

  const projects = [ 
    {
      id: 'ProjectDemo1',
      title: 'Project Demo 1',
      contract: 'metayield-proyect',
      votes: '0',
      desc: 'Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure'
    },
    {
      id: 'ProjectDemo2',
      title: 'Project Demo 2',
      contract: 'metayield-proyect',
      votes: '0',
      desc: 'Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure'
    },
    {
      id: 'ProjectDemo3',
      title: 'Project Demo 3',
      contract: 'metayield-proyect',
      votes: '0',
      desc: 'Nor again is there anyone who loves or pursues or desires to obtain pain of itself, because it is pain, but occasionally circumstances occur in which toil and pain can procure him some great pleasure'
    },
  ];
  const [myProject, setProject] = useState(projects);

  useEffect( ()=>{ ( async()=>{
    if(selector?.isSignedIn()) {
      const projectsTemp = projects;
      const myVotes1 = await getVotes("ProjectDemo1", "metayield-proyect")
      projectsTemp[0].votes = myVotes1;
      const myVotes2 = await getVotes("ProjectDemo2", "metayield-proyect")
      projectsTemp[1].votes = myVotes2;
      const myVotes3 = await getVotes("ProjectDemo3", "metayield-proyect")
      projectsTemp[2].votes = myVotes3;
      setProject(projectsTemp);
    }
  } )()
  },[selector])

  return (
    <section id="project-list">
      <Container mt={100} >
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'row', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'2xl'}> Project Demo List </Heading>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          {
            myProject.map((project: any, index: any)=>{
              return (
                <Project key={index} project={project}></Project>
              )
            })
          }
        </Flex>
      </Container>
    </section>
  );
};

export default ProjectList;
