/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Box,
  Image,
  Text, 
  Flex,
  VStack
} from "@chakra-ui/react";

type CardProps = {
  title: string,
  number: string | number,
  iconSrc: any,
  ligthMode?: boolean,
  horizontal?: boolean
}


const DashboardCard = (props: CardProps) => {

  return (
     <>
      { props.horizontal ? (
        <Box  mt={'20px'} >
          <Flex  h={'100%'} direction={'row'} justifyContent={'flex-start'}>
          <Image ml={10} mr={10} boxSize="20px" alt={props.title} src={props.iconSrc || './icons/check.png'}></Image>
          <Text  fontSize={'16px'}>{props.title || 'Card Title'}</Text>
          <Text ml={'auto'} mr={10} fontSize={'18px'} fontWeight={700} fontFamily={'Meta Space'} >{props.number || '0'}</Text>
        </Flex>
        </Box>
        ) : (
        
        <Box
          borderRadius={'8px'}
          bg={props.ligthMode ? "transparent" :"indigo.400"} 
          minWidth= {{base: '98px', md: '176px'}}
          padding= {'16px'}
          h= {'120px'}>
            <Flex h={'100%'} direction={'column'} justify={'space-evenly'}>
              <Image boxSize="25px" alt={props.title} src={props.iconSrc || './icons/check.png'}></Image>
              <Text opacity={0.6} mt={3} fontSize={'14px'}>{props.title || 'Card Title'}</Text>
              <Text fontSize={'24px'} fontFamily={'Meta Space'} >{props.number || '0'}</Text>
            </Flex>
          </Box>
        )
      }
     </>
      
    ) 
};

export default DashboardCard;
