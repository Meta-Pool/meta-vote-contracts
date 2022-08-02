import React from 'react';
import DashboardHeader from './DashHeader';
import LockingPosition from './LockingPositions';
import ListingVotes from './ListingVotes';
import { Container, Stack, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react';
import { colors } from "../../../constants/colors";


type Props = {
  shortVersion?: boolean
}

const MyDashboardPage = (props: Props) => {
  return (
      <Stack spacing={{base: 50, md: 50}} id="dashboard">
        <DashboardHeader></DashboardHeader>
        <Tabs px={{base:'5px', md: '10%'}}  colorScheme='black ' mb={50}>

          <TabList border={'2px solid white'} w={'fit-content'} borderRadius={100} bg={'white'} position={{base: 'inherit', md: 'relative'}} top={{base: 0 , md:-10}}>
            <Tab  borderRadius={100} py={'20px'} px={'32px'} borderColor={'white'}  _selected={{textUnderlineOffset: '10px', color: 'white' , bg: colors.secundary + '.500', textDecor: 'none' }} fontSize={{base: '16px', md: '24px'}}>My Voting Power</Tab>
            <Tab  borderRadius={100} py={'20px'} px={'32px'} borderColor={'white'}  _selected={{textUnderlineOffset: '10px', color: 'white' , bg: colors.secundary + '.500', textDecor: 'none' }} fontSize={{base: '16px', md: '24px'}}>My Votes</Tab>
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
