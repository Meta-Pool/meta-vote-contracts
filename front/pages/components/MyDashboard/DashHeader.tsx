import {Box, Button, Container, Flex, Heading, LinkOverlay, Text} from '@chakra-ui/react';
import React from 'react';
import { colors } from '../../../constants/colors';
import { useStore as useWallet } from "../../../stores/wallet";

type Props = {
  shortVersion?: boolean
}

const DashboardHeader = (props: Props) => {
  const { wallet, isLogin} = useWallet();

  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'3xl'}> Welcome {wallet && wallet.getAccountId()} </Heading>
          <Button w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
          </Button>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>My Voting Power</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>In use</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary} >
            <Text fontSize={'xl'}>Projects Finished</Text>
            <Text fontSize={'4xl'}>0</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary}>
            <Text fontSize={'xl'}>Projects you voted</Text>
            <Text fontSize={'4xl'}>0</Text>
          </Box>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>$META Locked</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>$META Unlocking</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box>
            <Text fontSize={'xl'}>$META to Withdraw</Text>
            <Text fontSize={'4xl'}>0</Text>
            <Button w={300} colorScheme={colors.primary}>
              Withdraw
            </Button>
          </Box>
        </Flex>
      </Container>

    </section>
  );
};

export default DashboardHeader;
