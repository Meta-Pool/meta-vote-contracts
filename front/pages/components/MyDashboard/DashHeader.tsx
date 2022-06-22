import {
  Button, 
  HStack, 
  Spacer, 
  Stack, 
  Text, 
  useDisclosure,
  VStack, 
} from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { colors } from '../../../constants/colors';
import { getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance, withdraw } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { yton } from '../../../lib/util';
import LockModal from './LockModal';

type Props = {
  shortVersion?: boolean
}

const DashboardHeader = (props: Props) => {
  const { wallet} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();
  const padding = '24px';

  const initMyData = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingPower = await getAvailableVotingPower(wallet);
    newVoterData.inUseVPower = await getInUseVotingPower(wallet);
    newVoterData.metaLocked = await getLockedBalance(wallet);
    newVoterData.metaToWithdraw = await getBalanceMetaVote(wallet);
    newVoterData.metaUnlocking = await getUnlockingBalance(wallet);
    newVoterData.projectsVoted = await getBalanceMetaVote(wallet); 
    setVoterData(newVoterData);
  }

  const withdrawClicked = async (amount: string)=> {
       withdraw(wallet, amount); 
  }

  useEffect(  () =>{
    (async ()=> {
      if (wallet && wallet.isSignedIn()) {
        initMyData()
      }
    })();
  },[wallet])


  return (
        <Stack w={'100%'} flexDirection={{ base: 'column', md: 'row' }} spacing={'10px'} justify={'space-between'}>
          <Stack w={{ base: '100%', md: '48%' }} backgroundColor={'white'}  spacing={10} p={padding} direction={'column'}>
            <HStack position={'relative'}>
              <VStack align={'flex-start'}>
                <Text fontSize={'xl'}>My Voting Power</Text>
                <Text fontSize={'5xl'} >{yton(voterData.votingPower)}</Text>
              </VStack>
              <Button position={'absolute'} h={'56px'} w={'56px'} top={0} right={0} onClick={onOpen}colorScheme={colors.primary}> +</Button>
            </HStack>
            
            <HStack justify={'space-between'}>
              <Text fontSize={'xl'}>In use</Text>
              <Text fontSize={'xl'} color={colors.primary}>{yton(voterData.inUseVPower)}</Text>
            </HStack>
            <HStack justify={'space-between'}>
              <Text fontSize={'xl'}>Projects you voted</Text>
              <Text fontSize={'xl'} color={colors.primary}>{voterData.votingResults.length}</Text>
            </HStack>
            <Spacer></Spacer>
            <Button  fontSize={{ base: "md", md: "xl" }}  onClick={onOpen} colorScheme={colors.secundary}>
              Lock $META to get Voting Power
            </Button>
          </Stack>
          <Stack w={{ base: '100%', md: '48%' }}  spacing={5} direction={'column'}>
            <HStack  justify={'space-between'} backgroundColor={'white'} p={padding}>
              <Text fontSize={'xl'}>$META locked</Text>
              <Text fontSize={'5xl'} color={colors.primary}>{yton(voterData.metaLocked)}</Text>
            </HStack>
            
            <HStack  justify={'space-between'} backgroundColor={'white'} p={padding}>
              <Text fontSize={'xl'}>$META unlocking</Text>
              <Text fontSize={'5xl'} color={colors.primary}>{yton(voterData.metaUnlocking)}</Text>
            </HStack>
           
            <HStack justify={'space-between'} backgroundColor={'white'} p={padding}>
              <Text fontSize={'xl'}>$META to withdraw</Text>
              <HStack>
                <Text fontSize={'5xl'} mr={'32px'}>{yton(voterData.metaToWithdraw)}</Text>
                <Button  fontSize={'xl'} disabled={ parseInt(voterData.metaToWithdraw)<=0} h={'80px'} onClick={()=> withdrawClicked(voterData.metaToWithdraw)} colorScheme={colors.primary}>
                  Withdraw
                </Button>
              </HStack>
            </HStack>            
          </Stack>
          <LockModal vPower={voterData.votingPower} isOpen={isOpen} onClose={onClose} wallet={wallet}></LockModal>
        </Stack>
  );
};

export default DashboardHeader;
 