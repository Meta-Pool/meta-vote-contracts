/* eslint-disable @next/next/no-img-element */
import * as React from "react";
import {
  Box,
  HStack,
  Stack,
  Button,
  Link,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  useBreakpointValue,
  Circle,
  Image
} from "@chakra-ui/react";
import { colors } from "../../../constants/colors";
import { yton } from "../../../lib/util";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { WHITELIST_SITES } from "../../../constants/whitelist";

type CardProps = {
  position: any,
  unvoteAction: any, 
  procesing: boolean,
}


const VoteCard = (props: CardProps) => {
  const { position, unvoteAction, procesing } = props;
  const isDesktop = useBreakpointValue({ base: false, md: true });

  const getProjectName = (project: string)=>{
    return project && project.substring(project.indexOf('|') + 1)
  }

  const getProjectId = (project: string)=>{
    return project && project.substring(0,project.indexOf('|'))
  }

  const getProjectLogoUrl = (platform: string) => {
    const platformData = WHITELIST_SITES.find((site: any)=> site.platform === platform);
    return platformData ? platformData.isologo : '';
  }

  return (
      
        isDesktop! ? (
          <Stack borderRadius={"30px"} spacing={10} minH={'234px'} bg={'#F9F9FA'} px={'20px'} py={'38px'} m={'11px'} justify={'space-between'} maxH={'200px'} minW={'330px'}>
            {/* Card header */}
            <HStack align={'flex-start'} justify={'space-between'}>
              <VStack align={'flex-start'}>
                <HStack>
                  <Circle mr={5} size={4} bg={colors.states.success}/>
                  <Text fontSize={'24px'} fontWeight={700}>{getProjectName(position?.id)} </Text>
                </HStack>
                <HStack fontSize={'16px'}>
                  <Text ml={'45px'}  fontWeight={700} fontFamily={'Meta Space'}>{yton(position?.current_votes).toFixed(4)}</Text>
                  <Text>Voting Power</Text> </HStack>
              </VStack>
              <Link href={'https://' + position?.votable_contract + '/vote/' + getProjectId(position?.id)} isExternal><ExternalLinkIcon boxSize={6}></ExternalLinkIcon></Link>
            </HStack>
            <Box>
    
            {/* Card Body */}
            <HStack justify={'space-between'}>
              <HStack spacing={0}>
                <Link href={'https://' + position?.votable_contract + '/vote/' + getProjectId(position?.id)} isExternal>
                  <Image src={getProjectLogoUrl(position?.votable_contract)} alt={'logo'}></Image>
                </Link>
              </HStack>
              <Box>
                <Button borderRadius={100} px={10} colorScheme={colors.primary} w={'100%'} onClick={ unvoteAction}>Unvote</Button>
              </Box>
            </HStack>
            </Box>
          </Stack>
        ) : (
          <Accordion  w={'100%'}  allowMultiple>
            <AccordionItem m={2} >
              <AccordionButton _expanded={{bg:'white'}} bg={{base: 'white'}}>
                <HStack w={'100%'} justify={'space-between'} textAlign="left">
                  <HStack>
                    <Circle mr={5} size={4} bg={colors.states.success}/>
                    <Text fontSize={'16px'}> {getProjectName(position?.id)}</Text>
                  </HStack>
                  <Text  bg={colors.secundary+".50"} p={2} fontSize={'18px'} fontWeight={700} fontFamily={'Meta Space'}>{yton(position?.current_votes).toFixed(4)} </Text>
                </HStack>
                <AccordionIcon ml={5} fontSize={'2xl'} />
              </AccordionButton>
              <AccordionPanel px={10} py={2} pb={20}>
                <VStack spacing={5}>
                  <HStack w={'100%'} justify={'space-between'}> 
                    <Text fontSize={'14px'}>Platform</Text>
                    <Text fontSize={'14px'} fontWeight={700}> {position?.votable_contract}</Text>
                  </HStack>
                  <HStack w={'100%'} justify={'space-between'}> 
                    <Text fontSize={'14px'}>Project</Text>
                    <Text fontSize={'14px'} fontWeight={700}> {position?.id}</Text>
                  </HStack>
                  <HStack>
                    <Image src={getProjectLogoUrl(position?.votable_contract)} alt={'logo'}></Image>
                    <Button disabled={procesing} borderRadius={100} w={'100%'} colorScheme={colors.primary} onClick={unvoteAction}>Unvote</Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        )
      
    ) 
};

export default VoteCard;
