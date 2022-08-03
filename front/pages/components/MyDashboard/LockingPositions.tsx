import {
  Button, 
  Flex, 
  Text, 
  useDisclosure, 
  VStack,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Tag,
  Square,
  Image,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Circle,
  useBreakpointValue,
  Heading,
  Box,
  Stack,
  Tooltip
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAllLockingPositions, relock, unlock, withdrawAPosition } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useVoter } from "../../../stores/voter";
import { getLockinPositionStatus, POSITION_STATUS, timeLeftTo, yton } from '../../../lib/util';
import LockModal from './LockModal';
import InfoModal, { InfoContent } from './InfoModal';
import { ACTION_TYPE, MODAL_TEXT } from '../../../constants';
import { STATUS_CODES } from 'http';
import moment from 'moment';
import ButtonOnLogin from '../ButtonLogin';
import VPositionCard from './VPositionCard';
import { AddIcon } from '@chakra-ui/icons';

type Props = {
}



const LockingPosition = (props: Props) => {

  const { wallet} = useWallet();
  const { voterData, setVoterData } = useVoter();
  const [ actionCall, setActionCall] = useState(() => ()=>{}); 
  const [ modalContent, setModalContent] = useState<InfoContent>({title: '', text:''}); 

  
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfoModal} = useDisclosure();

  const isDesktop = useBreakpointValue({ base: false, md: true });

  const STATUS = ['Locked', 'Unlocked', 'Unlocking...'];
 
  const getVotingPositions = async ()=> {
    const newVoterData = voterData;
    newVoterData.lockingPositions = await getAllLockingPositions(wallet);
    setVoterData(newVoterData);
  }

  const unlockPosition = (idPosition: string) => {
    try {
      unlock(idPosition, wallet);
    } catch (error) {
      console.error(error);
    }
  }

  const withdrawCall =  (positionId: string) => {
    try {
      withdrawAPosition(positionId, wallet); 
    } catch (error) {
      console.error(error);
    }
  }

  const relockClicked =  (positionIndex: string, period: string, amount: string) => {
    try {
      relock(positionIndex, period, amount, wallet);
    } catch (error) {
      console.error(error);
    }
  }



  const clickedAction = (idPosition: string, type: ACTION_TYPE, period? :string, amount?: string) => {
    switch (type) {
      case ACTION_TYPE.UNLOCK:
        setModalContent(MODAL_TEXT.UNLOCK)
        setActionCall(()=>()=> unlockPosition(idPosition))
        break;
      case ACTION_TYPE.RELOCK:
        setModalContent(MODAL_TEXT.RELOCK)
        if (period && amount ){
          setActionCall(()=>()=> relockClicked(idPosition, period, amount))
        }
        break;
      case ACTION_TYPE.WITHDRAW:
        setModalContent(MODAL_TEXT.WITHDRAW)
        setActionCall(()=>()=> withdrawCall(idPosition))
        break;
    }
    onOpenInfoModal();
  }

  useEffect(  () =>{
    (async ()=> {
      if (wallet && wallet.isSignedIn()) {
        getVotingPositions()
      }
    })();
  },[wallet])

  return (
    <section>        
        { 
            voterData.lockingPositions.length === 0 ? (
              <Flex minH={400} direction='column'  alignItems={'center'} justifyContent={'center'}>
                <Heading fontSize={'2xl'} >😅 You don’t have Voting Power</Heading>
                <ButtonOnLogin>
                  <Button w={350} fontSize={{ base: "md", md: "xl" }}  onClick={onOpen} colorScheme={colors.secundary}>
                    Lock $META to get Voting Power
                  </Button>
                </ButtonOnLogin>
                
              </Flex>
            ) : (
              <Flex flexWrap={'wrap'}>
                {  voterData.lockingPositions.map((position: any, index: number)=> {
                    return (
                        <VPositionCard 
                          key={index}
                          position={position}
                          vPower={yton(position.voting_power).toFixed(4)}
                          amount={yton(position.amount).toFixed(4)}
                          period={position.locking_period}
                          clickedAction= {clickedAction}
                          />
                    )
                })}
                
                <Tooltip label='Lock $META to get Voting Power'>
                  <Stack onClick={onOpen} _hover={{border: '3px solid lightgray', cursor: 'pointer'}} borderRadius={"30px"} bg={'#F9F9FA'} px={'20px'} py={'38px'} m={'11px'} justify={'center'} align={'center'} minH={'234px'} minW={'330px'}>
                    <AddIcon fontSize={'40px'} color={'lightgray'}></AddIcon>
                  </Stack>
                </Tooltip>
              </Flex>
          )
        }

      <InfoModal content={modalContent}  isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={actionCall} ></InfoModal>
      <LockModal isOpen={isOpen} onClose={onClose}></LockModal>
    </section>
  );
};

export default LockingPosition;


 