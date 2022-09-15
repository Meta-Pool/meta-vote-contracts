import {
  Box,
  Button, 
  HStack, 
  Stack, 
  Text, 
  Tooltip, 
  useBreakpointValue, 
  useDisclosure,
  useToast,
  VStack, 
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAllLockingPositions, getAvailableVotingPower, getBalanceMetaVote, getInUseVotingPower, getLockedBalance, getUnlockingBalance, withdrawAll } from '../../../lib/near';

import { useStore as useVoter } from "../../../stores/voter";
import { yton } from '../../../lib/util';
import LockModal from './LockModal';
import InfoModal from './InfoModal';
import { FETCH_VOTER_DATA_INTERVAL, MODAL_TEXT } from '../../../constants';
import ButtonOnLogin from '../ButtonLogin';
import DashboardCard from './DashboardCard';
import { useWalletSelector } from '../../../contexts/WalletSelectorContext';
import { AddIcon } from '@chakra-ui/icons';

type Props = {
}

const DashboardHeader = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { voterData, setVoterData } = useVoter();
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfo} = useDisclosure();
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const { selector } = useWalletSelector();
  const [ procesingFlag, setProcessFlag] = useState(false); 
  const toast = useToast();

  const padding = '24px';
  const waitingTime = 500;

  const getMyData = async ()=> {
    const newVoterData = voterData;
    newVoterData.votingPower = await getAvailableVotingPower();
    newVoterData.lockingPositions = await getAllLockingPositions();
    newVoterData.inUseVPower = await getInUseVotingPower();
    newVoterData.metaLocked = await getLockedBalance();
    newVoterData.metaToWithdraw = await getBalanceMetaVote();
    newVoterData.metaUnlocking = await getUnlockingBalance();
    setVoterData(newVoterData);
  }

  const withdrawClicked = async ()=> {
       onOpenInfo();
  }

  const withdrawCall =  () => {
    try {
      setProcessFlag(true);
      withdrawAll().then(()=> {
        toast({
          title: "Transaction success.",
          status: "success",
          duration: 9000,
          position: "top-right",
          isClosable: true,
        });
        setTimeout(() => {
          getMyData();  
        }, waitingTime);
        setProcessFlag(false);
      }).catch((error)=>
      {
        toast({
          title: "Transaction error.",
          description: error,
          status: "error",
          duration: 3000,
          position: "top-right",
          isClosable: true,
        });
        setProcessFlag(false);
      });
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
  }

  useEffect(  () =>{
    (async ()=> {
      if (selector && selector.isSignedIn()) {
        getMyData()
      }
    })();
    setInterval(()=>{
      getMyData();
    },FETCH_VOTER_DATA_INTERVAL)
  },[selector])

  return (
      <>
        <Stack 
          px={{base:'5px', md: '10%'}} 
          pt={{base:'32px', md: '50px'}} 
          pb={{base:'32px', md: '150px'}} 
          borderBottomLeftRadius={{base:'32px', md: '0px'}} 
          borderBottomRightRadius={{base:'32px', md: '0px'}} 
          bg={colors.bgGradient} 
          w={'100%'} 
          flexDirection={{ base: 'column', md: 'column' }}  
          color={'white'} 
          spacing={'10px'} 
          justify={'space-between'}>
          <Stack justify={'space-between'} wrap={{base: 'wrap'}} alignItems={'flex-start'} w={{ base: '100%'}}  spacing={10} p={padding} direction={'row'}>
            <HStack position={'relative'} spacing={2}>
              <VStack align={'flex-start'}>
              <Text hidden={!isDesktop} opacity={1} color={"#F9F9FA"} fontSize={'20px'} p={'8px'}>Available Voting Power</Text>
                <HStack spacing={10}>
                  <Text fontSize={{base: '22px', md: '64px'}} fontWeight={700} fontFamily={'Meta Space'} >{yton(voterData.votingPower)}</Text>
                  <Tooltip placement='right' hidden={!isDesktop} label='Lock $META to get Voting Power'>
                    <Button leftIcon={<AddIcon />} hidden={!isDesktop} fontSize={{base: '16px'}} fontWeight={500} borderRadius={100} disabled={!selector?.isSignedIn()}px={5} onClick={onOpen}colorScheme={colors.primary}> Add Voting Power</Button>
                  </Tooltip>
                </HStack>
                <Text hidden={isDesktop}  fontSize={{md:'16px', base: '8px'}}  p={'8px'}>Available Voting Power</Text>
              </VStack>
            </HStack>
            <Stack top={3} position={'relative'} hidden={isDesktop}>
              <ButtonOnLogin>
                <Button borderRadius={100} leftIcon={<AddIcon />} fontSize={{ base: "10px", md: "xl" }}  onClick={onOpen} colorScheme={colors.primary}>
                  Add Voting Power
                </Button>

              </ButtonOnLogin>
            </Stack>
          </Stack>
          <Stack w={{ base: '100%', md: '100%' }} flexWrap={{ base: 'wrap', md: 'nowrap' }} justifyContent={{base:'flex-end', md: 'space-between'}}  spacing={{base: 0, md: 5}} direction={'row'}>
            <HStack spacing={8}>
              <DashboardCard ligthMode={true} title='In use' iconSrc={'./icons/layer.svg'} number={yton(voterData.inUseVPower)}></DashboardCard>
              <DashboardCard ligthMode={true} title='Projects  voted' iconSrc={'./icons/check.svg'} number={voterData.votingResults.length}></DashboardCard>
            </HStack>
            <HStack spacing={8}>
              <Box hidden={!isDesktop}><DashboardCard   title='$META locked' iconSrc={'./icons/lock_white.svg'} number={yton(voterData.metaLocked)}></DashboardCard> </Box>
              <Box hidden={!isDesktop}><DashboardCard   title='$META unlocking' iconSrc={'./icons/unlock_white.svg'} number={yton(voterData.metaUnlocking)}></DashboardCard></Box>
              <Box hidden={!isDesktop} position={'relative'}>
                <DashboardCard  title='$META to withdraw' iconSrc={'./icons/withdraw_white.svg'} number={yton(voterData.metaToWithdraw)}></DashboardCard>
                <Button disabled={procesingFlag ||  parseInt(voterData.metaToWithdraw)<=0}  minWidth= {'176px'} position={'absolute'} bottom={'-55px'}  fontSize={'md'} fontWeight={700} px={6} borderRadius={100}  onClick={()=> withdrawClicked()} color={colors.primary} bg={'white'} >
                  Withdraw
                </Button>
              </Box>
            </HStack>
          </Stack> 
          <LockModal isOpen={isOpen} onClose={onClose} ></LockModal>
          <InfoModal content={MODAL_TEXT.WITHDRAW} isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={() => withdrawCall()} ></InfoModal>
        </Stack>
        <Box  hidden={isDesktop}>
          <DashboardCard horizontal={true} title='$META locked' iconSrc={'./icons/lock_bold.png'} number={yton(voterData.metaLocked)}></DashboardCard>
          <DashboardCard horizontal={true} title='$META unlocking' iconSrc={'./icons/unlock_bold.png'} number={yton(voterData.metaUnlocking)}></DashboardCard>
          <DashboardCard horizontal={true} title='$META to withdraw' iconSrc={'./icons/withdraw_bold.png'} number={yton(voterData.metaToWithdraw)}></DashboardCard>
          <Button disabled={ procesingFlag || parseInt(voterData.metaToWithdraw)<=0}  ml={'100px'} mt={5} p={{base: '10px' ,md:'32px'}} px={{base: '20px', md: '32px'}} fontSize={{base: 'md' ,md:'10px'}} borderRadius={100}  onClick={()=> withdrawClicked()} colorScheme={colors.primary} >
            Withdraw
          </Button>
        </Box>
      </>
  );
};

export default DashboardHeader;
