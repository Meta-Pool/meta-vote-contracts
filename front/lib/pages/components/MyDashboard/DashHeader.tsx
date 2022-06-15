import {
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  LinkOverlay, 
  Text, 
  useDisclosure, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton, 
  InputGroup,
  InputLeftAddon,
  Input,
  InputRightAddon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Divider,
  Spacer,
  VStack,
  StackDivider
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { getAvailableVotingPower } from '../../../lib/near';
import { useStore as useWallet } from "../../../stores/wallet";

type Props = {
  shortVersion?: boolean
}

const DashboardHeader = (props: Props) => {
  const { wallet, isLogin} = useWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [ sliderValue, setSliderValue] = useState(15);
  const [ votingPower, setVotingPower] = useState(0);
  const [ vPowerInUse, setVPowerInUse] = useState(0);


  useEffect(  () =>{
    (async ()=> {
      const vPower = await getAvailableVotingPower();
      setVotingPower(vPower);
    })();
  },[])


  return (
    <section>
      <Container id="dashboard-header">
        <Flex justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }} >
          <Heading lineHeight={'133%'} textAlign={{ base: 'center', md: 'start' }} fontWeight={700} color="gray.900" fontSize={'3xl'}> Welcome {wallet && wallet.getAccountId()} </Heading>
          <Button onClick={onOpen} w={300} colorScheme={colors.primary}>
            Lock $META to get Voting Power
          </Button>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>My Voting Power</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{votingPower}</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>In use</Text>
            <Text fontSize={'6xl'} color={colors.primary}>{vPowerInUse}</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary} >
            <Text fontSize={'xl'}>Projects Finished</Text>
            <Text fontSize={'4xl'}>0</Text>
          </Box>
          <Box p={10} border='2px' borderColor={colors.primary}>
            <Text fontSize={'xl'}>Projects you voted</Text>
            <Text fontSize={'4xl'}>0</Text>
          </Box>
        </Flex>
        <Flex mt={20} wrap={'wrap'} justifyContent={{ base: 'center', md: 'space-between' }} flexDirection={{ base: 'column', md: 'row' }}>
          <Box>
            <Text fontSize={'2xl'}>$META Locked</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box>
            <Text fontSize={'2xl'}>$META Unlocking</Text>
            <Text fontSize={'6xl'} color={colors.primary}>0</Text>
          </Box>
          <Box>
            <Text fontSize={'xl'}>$META to Withdraw</Text>
            <Text fontSize={'4xl'}>0</Text>
            <Button  w={300} colorScheme={colors.primary}>
              Withdraw
            </Button>
          </Box>
        </Flex>
      </Container>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Lock Position</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <Text fontSize={'xs'}>$META Amount {sliderValue}</Text>
              <InputGroup colorScheme={colors.primary} size='sm'>
                <InputLeftAddon> $META</InputLeftAddon>
                <Input colorScheme={colors.primary} placeholder='0' />
                <InputRightAddon>
                  <Button h='1.75rem' size='sm'>
                    Max
                  </Button>
                </InputRightAddon>  
              </InputGroup>
              <StackDivider></StackDivider >
              <Slider defaultValue={15} min={0} max={120} step={15} onChange={(val) => setSliderValue(val)}>
                <SliderTrack bg={colors.primary + '.200'}>
                  <Box position='relative' right={10} />
                  <SliderFilledTrack bg={colors.primary} />
                </SliderTrack>
                <SliderThumb bg={'gray.500'} boxSize={6} />
              </Slider>
              <Text>Autolock Days: {sliderValue}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={colors.primary} >Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </section>
  );
};

export default DashboardHeader;
