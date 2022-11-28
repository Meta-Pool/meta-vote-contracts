import React from 'react';
import DashboardHeader from './DashHeader';
import LockingPosition from './LockingPositions';
import ListingVotes from './ListingVotes';
import { Container, Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { colors } from "../../../constants/colors";
import { useRouter } from 'next/router';


type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  const router = useRouter();
  const tab = router.query.tab ? parseInt(router.query.tab as string) : 0;
  const selectedProps = {textUnderlineOffset: '10px', color: 'white' , bg: colors.secundary + '.500', textDecor: 'none' };
  return (
      <Stack spacing={{base: 50, md: 50}} id="dashboard">
        <DashboardHeader></DashboardHeader>
        <Tabs defaultIndex={tab} px={{base:'5px', md: '10%'}}  colorScheme='black ' mb={50}>
          <TabList border={'4px solid white'} w={'fit-content'} borderRadius={100} bg={'white'} position={{base: 'inherit', md: 'relative'}} top={{base: 0 , md:-20}}>
            <Tab  borderRadius={100} py={{base:'10px',md:'15px'}} px={'32px'} borderColor={'white'}  _selected={selectedProps} fontSize={{base: '16px', md: '24px'}}>My Voting Power</Tab>
            <Tab  borderRadius={100} py={{base:'10px',md:'15px'}} px={'32px'} borderColor={'white'}  _selected={selectedProps} fontSize={{base: '16px', md: '24px'}}>My Votes</Tab>
          </TabList>
          <TabPanels backgroundColor={{md: 'white'}} >
            <TabPanel p={0}>
            <LockingPosition></LockingPosition>
            </TabPanel>
            <TabPanel p={0}>
            <ListingVotes></ListingVotes>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>

  );
};

export default MyDashboardPage;
