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
  Box
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
  const getTimeRemaining = (position: any): string => {
    const timeUnlockingStartAt = moment(position.unlocking_started_at);
    const unlockingFinishedTime = timeUnlockingStartAt.add(position.locking_period, 'day');



    return getLockinPositionStatus(position) === POSITION_STATUS.UNLOKING ? timeLeftTo(unlockingFinishedTime) : getLockinPositionStatus(position) === POSITION_STATUS.UNLOCKED ? '0 days' : '-'
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

  const getStatusTag = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <Tag colorScheme={colors.states.success} variant='solid'>{ STATUS[getLockinPositionStatus(position)]}</Tag> )

      case POSITION_STATUS.UNLOCKED:
        return ( <Tag colorScheme={colors.states.danger} variant='solid'>{ STATUS[getLockinPositionStatus(position)]}</Tag>)

      case POSITION_STATUS.UNLOKING:
        return ( <Tag colorScheme={colors.states.warning} variant='solid'>{ STATUS[getLockinPositionStatus(position)]}</Tag> ) 
    }
  }

  const getStatusCircle = (position: any, hideText?: boolean)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <><Circle mr={5} size={4} bg={colors.states.success}/>{!hideText && STATUS[getLockinPositionStatus(position)]}</> )

      case POSITION_STATUS.UNLOCKED:
        return ( <><Circle mr={5} size={4} bg={colors.states.danger}/>{!hideText && STATUS[getLockinPositionStatus(position)]}</>)

      case POSITION_STATUS.UNLOKING:
        return (<><Circle mr={5} size={4} bg={colors.states.warning}/>{!hideText && STATUS[getLockinPositionStatus(position)]}</> ) 
    }
  }

  const getButtonbyStatus = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <Button borderRadius={100} fontSize={'16px'} colorScheme={colors.primary}  w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.UNLOCK)}>Start unlock</Button> )

      case POSITION_STATUS.UNLOCKED:
        return ( <Button borderRadius={100} fontSize={'16px'} colorScheme={colors.primary} w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.WITHDRAW)}>Withdraw</Button>)

      case POSITION_STATUS.UNLOKING:
        return ( <Button borderRadius={100} fontSize={'16px'} colorScheme={colors.primary} w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.RELOCK, position.locking_period, position.amount)}>Relock</Button> ) 
    }
  }

  const getIconStatus = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return (           
          <Image mr={2} boxSize="20px" alt={'locked'} src={'./icons/lock_gray.png'}></Image>
        )

      case POSITION_STATUS.UNLOCKED:
        return ( <Image mr={2} boxSize="20px" alt={'locked'} src={'./icons/unlock_gray.png'}></Image>)

      case POSITION_STATUS.UNLOKING:
        return ( <>
        <Image mr={2} boxSize="20px" alt={'locked'} src={'./icons/unlock_gray.png'}></Image>
        <Image mr={2} boxSize="20px" alt={'locked'} src={'./icons/clock_gray.png'}></Image>
        </> ) 
    }
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
        { /* *********** DESKTOP UI ***************** */
          isDesktop && (
            <>
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
                                  vPower={yton(position.voting_power).toFixed(4)}
                                  amount={yton(position.amount).toFixed(4)}
                                  period={position.locking_period}
                                  remaining={getTimeRemaining(position)}
                                  status={getLockinPositionStatus(position)}
                                  statusElement={getStatusCircle(position, true)}
                                  icon={getIconStatus(position)}
                                  button={(getButtonbyStatus(position))}/>
                            )
                        })}

                      </Flex>
                    )
                  }
                  
              </>
            )
        }

        {   /************ MOBILE UI ******************/
          !isDesktop && (
            <>
              {
                    voterData.lockingPositions.length === 0 && (
                      <Flex minH={400} direction='column' alignItems={'center'} justifyContent={'center'}>
                        <Heading fontSize={'2xl'} >😅 You don’t have Voting Power</Heading>
                        <Button w={350} fontSize={{ base: "md", md: "xl" }}  onClick={onOpen} colorScheme={colors.secundary}>
                          Lock $META to get Voting Power
                        </Button>
                      </Flex>
                    )
                  }
              {
                voterData.lockingPositions.map( (position: any, index: number)=> 
                 {
                  return (
                    <Accordion  key={index} allowMultiple>
                      <AccordionItem m={2} >
                        <AccordionButton  _expanded={{bg:'white'}}  bg={{base: 'white'}}>
                          <HStack w={'100%'} justify={'space-between'} textAlign="left">
                            <HStack>{ getStatusCircle(position, true)}
                            <Text fontSize={'14px'}>{position.locking_period} days </Text></HStack>
                            <Text  bg={colors.secundary+".50"} p={2}  fontWeight={700} fontSize={'18px'}>{yton(position.voting_power).toFixed(4)} </Text>
                          </HStack>
                          <AccordionIcon ml={5} fontSize={'2xl'} />
                        </AccordionButton>
                        <AccordionPanel >
                          <VStack px={5} pb={10}>
                            <HStack w={'100%'} justify={'space-between'}> 
                              <HStack>
                                <Image mr={10} boxSize="20px" alt={'amount-icon'} src={'./meta.png'}></Image>
                                <Text textAlign={'start'}  fontSize={'14px'}>$META amount:</Text>
                              </HStack>
                              <Text p={2} fontWeight={700} bg={colors.secundary+".50"} fontSize={'14px'}> {yton(position.amount).toFixed(4)}</Text>
                            </HStack>
                            <HStack w={'100%'} justify={'space-between'}> 
                              <HStack>
                                <Image mr={10} boxSize="20px" alt={'lock-icon'} src={'./icons/lock_bold.png'}></Image>
                                <Text textAlign={'start'}  fontSize={'14px'}>Autolock </Text>
                              </HStack>
                              <Text p={2} fontWeight={700} bg={colors.secundary+".50"} fontSize={'14px'}> {position.locking_period} days</Text>
                            </HStack>
                            <HStack w={'100%'} justify={'space-between'}> 
                              <HStack>
                                <Image mr={10} boxSize="20px" alt={'time-icon'} src={'./icons/clock.png'}></Image>
                                <Text textAlign={'start'}  fontSize={'14px'}>Remaining time</Text>
                              </HStack>
                              <Text p={2} fontWeight={700} bg={colors.secundary+".50"} fontSize={'14px'}> {getTimeRemaining(position)} </Text>
                            </HStack>
                            <HStack  w={'100%'} justify={'space-between'}> 
                              <HStack>
                                <Box mr={7}>
                                  {getStatusCircle(position, true)}
                                </Box>
                                <Text textAlign={'start'}  fontSize={'14px'}>Status</Text>

                              </HStack>
                              <Text ml={8} p={2} fontWeight={700} fontSize={'14px'}> {STATUS[getLockinPositionStatus(position)]}</Text>
                            </HStack>
                            <HStack  w={'100%'}>
                              { getButtonbyStatus(position)}

                            </HStack>
                          </VStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  )
                 }
                )
              }
            </>
          )
        }             
      <InfoModal content={modalContent}  isOpen={infoIsOpen} onClose={infoOnClose} onSubmit={actionCall} ></InfoModal>
      <LockModal isOpen={isOpen} onClose={onClose}></LockModal>
    </section>
  );
};

export default LockingPosition;


 