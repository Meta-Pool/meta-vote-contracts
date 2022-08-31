import React from 'react';
import { Center, Image, ListItem, Spacer, Stack, Text, UnorderedList, useBreakpointValue, VStack } from '@chakra-ui/react';
import { colors } from "../../constants/colors";
import ButtonOnLogin from './ButtonLogin';


type Props = {
  shortVersion?: boolean
}

const LoginPage = (props: Props) => {
  const isDesktop = useBreakpointValue({ base: false, md: true });

  return (
    <Stack flexDirection={{ base: 'column', md: 'row' }} >
      <Stack 
        px={{base:'24px', md: '5%'}} 
        pt={{base:'32px', md: '50px'}} 
        pb={{base:'50px', md: '150px'}} 
        minH={{base: '340px', md: '100vh'}}
        borderBottomLeftRadius={{base:'32px', md: '0px'}} 
        borderBottomRightRadius={{base:'32px', md: '0px'}} 
        bg={colors.bgGradient} 
        w={{base: '100%', md: '50%'}} 
        flexDirection={{ base: 'column', md: 'column' }} 
        spacing={2} 
        color={'white'} 
        justify={'space-between'}>

        <Image alt='logo metavote' alignSelf={{base: 'center', md: 'flex-start'}}  w={{base:'40vw', md: '30vw'}} src="/metavote_logo.svg"></Image>
        <VStack hidden={isDesktop}  alignSelf={{base: 'flex-start'}}  spacing={0}>
          <Text lineHeight={'32px'} fontFamily={'Meta Space'}  fontSize={{base: '26px', md:'40px'}}>Get voting power, </Text>
          <Text lineHeight={'32px'} fontFamily={'Meta Space'}  fontSize={{base: '26px', md:'40px'}}>vote for projects,</Text>
          <Text lineHeight={'32px'} fontFamily={'Meta Space'}  fontSize={{base: '26px', md:'40px'}}> and earn tokens.</Text>
        </VStack>
        <Text hidden={!isDesktop} fontFamily={'Meta Space'} fontSize={{base: '26px', md:'32px'}}>Welcome to the Community-based Voting Platform for Projects Fundraising on Meta Yield!</Text>
        <UnorderedList px={8}>
          <ListItem>Lock your $META tokens </ListItem>
          <ListItem>Get voting power</ListItem>
          <ListItem>Vote on projects in Meta Yield</ListItem>
        </UnorderedList>
      </Stack>
      <Center w={{base: '100%', md: '50%'}}>
        <VStack 
          align={'flex-start'}
          justify={'center'}
          spacing={20}>
          <VStack align={'flex-start'}>
            <Text color={colors.primary + '.900'} fontSize={'48px'} fontWeight={600}> Sign in with your wallet</Text>
            <Text fontWeight={600}> User your wallet to access Meta Vote</Text>
          </VStack>
          <ButtonOnLogin color={colors.primary} variant='solid'/>
        </VStack>
      </Center>
    </Stack>

  );
};

export default LoginPage;
