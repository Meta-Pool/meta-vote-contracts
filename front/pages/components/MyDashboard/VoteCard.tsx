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
  Stack
} from "@chakra-ui/react";
import { POSITION_STATUS } from "../../../lib/util";

type CardProps = {
  vPower: any,
  amount: any,
  period: any,
  status: POSITION_STATUS,
  remaining: string,
  statusElement: JSX.Element,
  icon: JSX.Element,
  button: JSX.Element,
}


const VoteCard = (props: CardProps) => {

  return (
      
        <Stack bg={'#F9F9FA'} px={'20px'} py={'38px'} m={'11px'} justify={'space-between'} minH={'234px'} minW={'330px'}>
          {/* Card header */}
          <HStack align={'flex-start'} justify={'space-between'}>
            <VStack spacing={0} align={'flex-start'}>
              <Text fontSize={'24px'} fontWeight={700} fontFamily={'Meta Space'}>1.01131</Text>
              <Text>Voting Power</Text>
            </VStack>
            <HStack>
              <Image
                boxSize="20px"
                objectFit="cover"
                src="/meta.png"
                alt="stnear"
              />
              <Text>1.000</Text>
            </HStack>
          </HStack>
          
          <Box>
            {/* Icons bar  */}
          <HStack spacing={0} justify={'flex-start'}>
            {props.icon}
          </HStack>
          
          {/* Card Body */}
          <HStack justify={'space-between'}>
            <HStack spacing={0}>
              {props.statusElement}
              {
                (props.status && POSITION_STATUS.UNLOKING) ? 
                (<Text>{props.remaining}</Text>) :
                (<Text>{props.period} days</Text>)
              }
            </HStack>
              
            <Box>
              {props.button}
            </Box>
          </HStack>
          </Box>
        </Stack>
      
    ) 
};

export default VoteCard;
