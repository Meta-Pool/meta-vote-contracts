/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Box,
  Image,
  Text, 
  Stack,
  Flex
} from "@chakra-ui/react";

type CardProps = {
  title: string,
  number: string | number,
  iconSrc: any,
  ligthMode?: boolean
}


const DashboardCard = (props: CardProps) => {


  return (
      <Box
        bg={props.ligthMode ? "transparent" :"#120e2829"} 
        minWidth= {'176px'}
        padding= {'16px'}
        h= {'120px'}
      >
        <Flex h={'100%'} direction={'column'} justify={'space-evenly'}>
          <Image boxSize="20px" alt={props.title} src={props.iconSrc || './icons/check.png'}></Image>
          <Text opacity={0.6} mt={3} fontSize={'14px'}>{props.title || 'Card Title'}</Text>
          <Text fontSize={'24px'} fontFamily={'Meta Space'} >{props.number || '0'}</Text>
        </Flex>
      </Box>
    ) 
};

export default DashboardCard;
