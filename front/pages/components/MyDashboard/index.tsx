import React from 'react';
import DashboardHeader from './DashHeader';
import LockingPosition from './LockingPositions';
import ListingVotes from './ListingVotes';
import { Container, Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';


type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <Stack id="dashboard">
        <DashboardHeader></DashboardHeader>
        <Tabs  colorScheme='black ' mt={50} mb={50}>

          <TabList  >
            <Tab  borderTopRadius={'32px'} p={'32px'} _selected={{textUnderlineOffset: '10px', color: 'black' , bg: { base: 'none', md: 'white'}, textDecor: { base: 'underline', md: 'none'} }} fontSize={{base: 'xl', md: '4xl'}} >My Voting Power</Tab>
            <Tab  borderTopRadius={'32px'} p={'32px'} _selected={{textUnderlineOffset: '10px', color: 'black' , bg: { base: 'none', md: 'white'}, textDecor: { base: 'underline', md: 'none'} }} fontSize={{base: 'xl', md: '4xl'}}>My Votes</Tab>
          </TabList>
          <TabPanels backgroundColor={{md: 'white'}} >
            <TabPanel>
            <LockingPosition></LockingPosition>
            </TabPanel>
            <TabPanel>
            <ListingVotes></ListingVotes>
            </TabPanel>
          </TabPanels>
        </Tabs>

        {/*<ProjectList></ProjectList>*/}
      </Stack>

  );
};

export default MyDashboardPage;
