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
import { useStore as useVoter } from "../../../stores/voter";
import { yton } from '../../../lib/util';
import LockModal from './LockModal';
import InfoModal, { InfoContent } from './InfoModal';
import { ACTION_TYPE, MODAL_TEXT } from '../../../constants';

import ButtonOnLogin from '../ButtonLogin';
import VPositionCard from './VPositionCard';
import { AddIcon } from '@chakra-ui/icons';
import { useWalletSelector } from '../../contexts/WalletSelectorContext';

type Props = {
}

const LockingPosition = (props: Props) => {

  const { voterData, setVoterData } = useVoter();
  const [ actionCall, setActionCall] = useState(() => ()=>{}); 
  const [ procesingFlag, setProcessFlag] = useState(false); 

  const [ modalContent, setModalContent] = useState<InfoContent>({title: '', text:''}); 
  const { selector} = useWalletSelector();

  const { isOpen, onClose, onOpen } = useDisclosure();
  const { isOpen : infoIsOpen,  onClose : infoOnClose, onOpen: onOpenInfoModal} = useDisclosure();

  const isDesktop = useBreakpointValue({ base: false, md: true });
 
  const getVotingPositions = async ()=> {
    const newVoterData = voterData;
    newVoterData.lockingPositions = [];
    setVoterData(newVoterData);
    newVoterData.lockingPositions = await getAllLockingPositions();
    setVoterData(newVoterData);
  }

  const waitingTime = 500;

  const unlockPosition = (idPosition: string) => {
    try {
      setProcessFlag(true);
      unlock(idPosition).then(()=> {
        // After the action I need to wait some async time to give the contract time to update the data. 
        // Withoud the setTiemout the get is not retrieving the updated data
        setTimeout(() => {
          getVotingPositions();  
        }, waitingTime);
        setProcessFlag(false);
      });
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();

  }

  const withdrawCall =  (positionId: string) => {
    try {
      setProcessFlag(true);
      withdrawAPosition(positionId).then(()=> {
        setTimeout(() => {
          getVotingPositions();  
        }, waitingTime);
        setProcessFlag(false);
      }); 
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
  }

  const relockClicked =  (positionIndex: string, period: string, amount: string) => {
    try {
      setProcessFlag(true);
      relock(positionIndex, period, amount).then(()=> {
        setTimeout(() => {
          getVotingPositions();  
        }, waitingTime);
        setProcessFlag(false);
      }); 
    } catch (error) {
      setProcessFlag(false);
      console.error(error);
    }
    infoOnClose();
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
      if (selector && selector.isSignedIn()) {
        getVotingPositions()
      }
    })();
  },[selector])

  return (
    <section>        
        { 
            voterData.lockingPositions.length === 0 ? (
              <Flex minH={400} direction='column'  alignItems={'center'} justifyContent={'center'}>
                <Heading fontSize={'2xl'} >😅 You don’t have Voting Power</Heading>
                <ButtonOnLogin>
                  <Button borderRadius={100} w={350} fontSize={{ base: "md", md: "xl" }}  onClick={onOpen} colorScheme={colors.primary}>
                    Lock $META to get Voting Power
                  </Button>
                </ButtonOnLogin>
                
              </Flex>
            ) : (
              <Flex flexWrap={'wrap'} justifyContent={'space-between'}>
                {  voterData.lockingPositions.map((position: any, index: number)=> {
                    return (
                        <VPositionCard 
                          key={index}
                          position={position}
                          vPower={yton(position.voting_power).toFixed(4)}
                          amount={yton(position.amount).toFixed(4)}
                          period={position.locking_period}
                          clickedAction= {clickedAction}
                          procesing={procesingFlag}
                          />
                    )
                })}
                
                <Tooltip hidden={!isDesktop} label='Lock $META to get Voting Power'>
                  <Stack hidden={!isDesktop} onClick={onOpen} _hover={{border: '3px solid lightgray', cursor: 'pointer'}} borderRadius={"30px"} bg={'#F9F9FA'} px={'20px'} py={'38px'} m={'11px'} justify={'center'} align={'center'} minH={'234px'} minW={'330px'}>
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


 