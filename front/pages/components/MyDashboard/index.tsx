import React from 'react';
import DashboardHeader from './DashHeader';
import ProjectList from './ProjectList';
import LockingPosition from './LockingPositions';
import ListingVotes from './ListingVotes';
import { Container, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { colors } from '../../../constants/colors';

type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <Container id="dashboard">
        <DashboardHeader></DashboardHeader>
        <Tabs  colorScheme='green' mt={100}>
          <TabList>
            <Tab>My Voting Power</Tab>
            <Tab>My Votes</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <LockingPosition></LockingPosition>
            </TabPanel>
            <TabPanel>
             <ListingVotes></ListingVotes>
            </TabPanel>
          </TabPanels>
        </Tabs>
        <ProjectList></ProjectList>
      </Container>

  );
};

export default MyDashboardPage;
