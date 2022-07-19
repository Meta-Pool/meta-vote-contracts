import {
  Box, 
  Button, 
  Text, 
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
  VStack,
  StackDivider,
  HStack,
  Square,
  Image,
  Flex,
  Spacer,
  Divider,
  Stack
} from '@chakra-ui/react';
import React, {  useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { lock } from '../../../lib/near';
import { FormikContext, useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { ntoy, yton } from '../../../lib/util';
import { useStore as useVoter } from "../../../stores/voter";
import { useStore as useWallet } from "../../../stores/wallet";
import { useStore as useBalance } from "../../../stores/balance";

type Props = {
  isOpen: any, 
  onClose: any,
}

const LockModal = (props: Props) => {
  const { isOpen, onClose} = props;
  const [ sliderValue, setSliderValue] = useState(30);
  const [ vPowerSim, setVPowerSim] = useState(0);
  const { wallet }= useWallet();
  const { balance } = useBalance();
  const { voterData } = useVoter();

  const initialValuesDeposit: any = {
    amount_lock: 0,
    balance: balance
  };

  const formikLock = useFormik({
    initialValues: initialValuesDeposit,
    validationSchema: lockValidation,
    validateOnMount: true,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values: any) => {
      if (values.amount_lock < 1) {
        // show toast error
      } else {
        lockMetas(values);
      }
    }
  });

  const inputChange = (e: any, blur?: boolean)=>{
    updateVpowerSim(e.target.value);
    blur ? formikLock.handleBlur(e) : formikLock.handleChange(e);
  }

  const updateVpowerSim = (amount? : any)=> {
    const vPower = calculateVPower(sliderValue, amount ? amount : formikLock.values.amount_lock);
    setVPowerSim(vPower);
  }

  const calculateVPower = (days: any, amount: any)=> {
    const minLockPeriod = 1;
    const maxLockPeriod = 300;
    const multiplier = 1 + (4 * (days - minLockPeriod) / (maxLockPeriod - minLockPeriod))
    return amount * multiplier;
  }

  useEffect(() => {
    formikLock.setValues({
      amount_lock: 0,
      balance: balance
    })
  }, [])

  useEffect(() => {
    updateVpowerSim();
  }, [sliderValue])

  
  

  const maxButtonClicked = ()=> {
    formikLock.setValues({amount_lock: balance.toString(), balance: balance});
  }
  
  const lockMetas = (values: any)=> {
    try {
      lock( sliderValue.toString(), ntoy(formikLock.values.amount_lock), wallet);
    }
    catch (error) {
      console.error(error);
    } 
  }

  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg={'purple.900'}>
          <ModalHeader textAlign={'center'} color={'white'} fontWeight={500}>New Lock Position</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <Text fontWeight={400} color={'white'} fontSize={'sm'}>$META amount</Text>
              <HStack spacing={10}>
                  <InputGroup  colorScheme={colors.primary} size='lg'>
                    <InputLeftAddon> 
                          <Square minW="30px">
                            <Image
                              boxSize="20px"
                              objectFit="cover"
                              src="/meta.svg"
                              alt="stnear"
                            />
                          </Square>
                    </InputLeftAddon>
                    <Input
                        id="amount_lock"
                        name="amount_lock"
                        type="number"
                        colorScheme={colors.primary} 
                        value={formikLock.values.amount_lock}
                        onPaste={(e)=> inputChange(e)}
                        onBlur={(e)=> inputChange(e, true)}
                        onChange={(e)=> inputChange(e)}
                    ></Input>
                    <InputRightAddon>
                      <Button bg={'black'} color={'white'} h='1.75rem' size='sm' onClick={()=>maxButtonClicked()}>
                        Max
                      </Button>
                    </InputRightAddon>  
                  </InputGroup>
              </HStack>
              {
                formikLock.dirty && (
                  <Stack>
                    <Text dangerouslySetInnerHTML={{ __html: (formikLock.errors && formikLock.errors.amount_lock )? formikLock.errors.amount_lock as  string : ''}} fontSize={'xs'} color={'red'}></Text>
                  </Stack>
                )
              }
              
              <StackDivider></StackDivider >
              <Slider defaultValue={30} min={0} max={300} step={1} onChange={(val) => setSliderValue(val)}>
                <SliderTrack bg={colors.primary + '.200'}>
                  <Box position='relative' right={10} />
                  <SliderFilledTrack bg={colors.primary +'.500'} />
                </SliderTrack>
                <SliderThumb bg={colors.primary+'.500'} boxSize={6} />
              </Slider>
              <Stack w={'100%'} direction={{base:'column', md:'row'}} justify={'space-between'}>
                <VStack align={{base:'flex-start', md:'flex-Start'}}>
                  <Text fontWeight={200} fontSize={'lg'} color={'indigo.500'}>AutoLock days</Text> 
                  <Text fontWeight={500} fontSize={'lg'} color={'white'}>{sliderValue}</Text> 
                  
                </VStack>
                <VStack align={{base:'flex-start', md:'flex-end'}}>
                  <Text fontWeight={500} fontSize={'lg'}   color={'indigo.500'}> Voting Power</Text>
                  <Text fontWeight={500} fontSize={'lg'}  color={'white'}> { vPowerSim.toFixed(4)} </Text>
                </VStack>
              </Stack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex  w={'100%'} direction={{base: 'column', md: 'row'}} justifyContent={'center'}>
              <Button colorScheme={colors.secundary} onClick={(e: any) => formikLock.handleSubmit(e)}  m={1}>Lock</Button>
              <Button variant='outline' color={'white'} bg={'purple.900'} _hover={{ bg: 'grey' }} m={1} onClick={onClose}>
                Cancel
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default LockModal;
