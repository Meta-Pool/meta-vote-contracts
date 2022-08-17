/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Box,
  Image,
  Text, 
  Flex,
  VStack,
  HStack,
  Avatar,
  Stack,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  AccordionIcon,
  Circle,
  Tooltip
} from "@chakra-ui/react";
import { getLockinPositionStatus, POSITION_STATUS, timeLeftTo, yton } from "../../../lib/util";
import { colors } from "../../../constants/colors";
import moment from "moment";
import { ACTION_TYPE } from "../../../constants";

type CardProps = {
  position: any
  vPower: any,
  amount: any,
  period: any,
  clickedAction: any,
  procesing: boolean
}


const VPositionCard = (props: CardProps) => {
  const {
    position,
    vPower,
    amount,
    period,
    clickedAction,
    procesing
  } = props;
  const isDesktop = useBreakpointValue({ base: false, md: true });
  const STATUS = ['Locked', 'Unlocked', 'Unlocking...'];

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

  const getTimeRemaining = (position: any): string => {
    const timeUnlockingStartAt = moment(position.unlocking_started_at);
    const unlockingFinishedTime = timeUnlockingStartAt.add(position.locking_period, 'day');



    return getLockinPositionStatus(position) === POSITION_STATUS.UNLOKING ? timeLeftTo(unlockingFinishedTime) : getLockinPositionStatus(position) === POSITION_STATUS.UNLOCKED ? '0 days' : '-'
  }

  const getButtonbyStatus = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return ( <Button borderRadius={100} disabled={procesing} fontSize={'16px'} colorScheme={colors.primary}  w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.UNLOCK)}>Start unlock</Button> )

      case POSITION_STATUS.UNLOCKED:
        return ( <Button borderRadius={100} disabled={procesing} fontSize={'16px'} colorScheme={colors.primary} w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.WITHDRAW)}>Withdraw</Button>)

      case POSITION_STATUS.UNLOKING:
        return ( <Button borderRadius={100} disabled={procesing} fontSize={'16px'} colorScheme={colors.primary} w={'100%'} onClick={()=> clickedAction(position.index, ACTION_TYPE.RELOCK, position.locking_period, position.amount)}>Relock</Button> ) 
    }
  }
  

  const getIconStatus = (position: any)=> {
    const status = getLockinPositionStatus(position); 
    switch (status) {
      case POSITION_STATUS.LOCKED:
        return (                   
          <Tooltip hidden={!isDesktop} label='This position is Locked.'>
              <Image mr={2} boxSize="20px" alt={'locked'} src={'./icons/lock_gray.png'}></Image>
          </Tooltip>        
        )

      case POSITION_STATUS.UNLOCKED:
        return ( 
          <Tooltip hidden={!isDesktop} label='This position is Unlocked.'>
            <Image mr={2} boxSize="20px" alt={'unlocked'} src={'./icons/unlock_gray.png'}></Image>
          </Tooltip>
          )

      case POSITION_STATUS.UNLOKING:
        return ( 
          <Tooltip hidden={!isDesktop} label='Unlocking the position.'>
            <HStack spacing={0}>
              <Image mr={2} boxSize="20px" alt={'unlocked'} src={'./icons/unlock_gray.png'}></Image>
              <Image mr={2} boxSize="20px" alt={'clock'} src={'./icons/clock_gray.png'}></Image>
            </HStack>
          </Tooltip>
        ) 
    }
  }
  if (!position) {
    return (<></>)
  }
  return (
          isDesktop ? (
            <Stack bg={'#F9F9FA'} borderRadius={"30px"} px={'20px'} py={'38px'} m={'11px'} justify={'space-between'} minH={'234px'} minW={'330px'}>
              {/* Card header */}
              <HStack align={'flex-start'} justify={'space-between'}>
                <VStack spacing={0} align={'flex-start'}>
                  <Text fontSize={'24px'} fontWeight={700} fontFamily={'Meta Space'}>{vPower}</Text>
                  <Text>Voting Power</Text>
                </VStack>
                <HStack>
                  <Image
                    boxSize="20px"
                    objectFit="cover"
                    src="/meta.png"
                    alt="stnear"
                  />
                  <Text  fontWeight={700} fontSize={'18px'}>{amount}</Text>
                </HStack>
              </HStack>
              <Box>
                {/* Icons bar  */}
              <HStack spacing={0} justify={'flex-start'}>
                {getIconStatus(position)}
              </HStack>
              
              {/* Card Body */}
              <HStack justify={'space-between'}>
                <HStack spacing={0}>
                  {getStatusCircle(position, true)}
                  {
                    (getLockinPositionStatus(position) === POSITION_STATUS.UNLOKING) ? 
                    (<Text>{getTimeRemaining(position)}</Text>) :
                    (<Text>{period} days</Text>)
                  }
                </HStack>
                <Box>
                  {getButtonbyStatus(position)}
                </Box>
              </HStack>
              </Box>
            </Stack>
          ) :
          (
            <Accordion w={'100%'} allowMultiple>
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
    ) 
};

export default VPositionCard;
