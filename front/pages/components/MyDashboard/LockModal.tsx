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
  Stack,
  useToast
} from '@chakra-ui/react';
import React, {  useEffect, useState } from 'react';
import { colors } from '../../../constants/colors';
import { lock } from '../../../lib/near';
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { ntoy } from '../../../lib/util';
import { useStore as useBalance } from "../../../stores/balance";
import { DEFAULT_LOCK_DAYS, MAX_LOCK_DAYS, MIN_LOCK_DAYS, MODAL_DURATION } from '../../../constants';

type Props = {
  isOpen: any, 
  onClose: any,
}

const LockModal = (props: Props) => {
  const { isOpen, onClose} = props;
  const [ sliderValue, setSliderValue] = useState(DEFAULT_LOCK_DAYS);
  const [ vPowerSim, setVPowerSim] = useState(0);
  const { balance } = useBalance();
  const toast = useToast();

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

  const calculateVPower = (days: any, amount: any) => {
    const multiplier = getMultiplierPerDays(days);
    return Number((amount * multiplier).toFixed(8));
  }

  const getMultiplierPerDays = (days: number) => {
    if(!days) {
      return 1;
    }
    return  1 + (4 * (days - MIN_LOCK_DAYS) / (MAX_LOCK_DAYS - MIN_LOCK_DAYS));
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
    updateVpowerSim(balance);

  }
  
  const lockMetas = (values: any)=> {
      lock( sliderValue.toString(), ntoy(formikLock.values.amount_lock))
        .then((val)=>{
          toast({
            title: "Lock success.",
            status: "success",
            duration: MODAL_DURATION.SUCCESS,
            position: "top-right",
            isClosable: true,
          });
          onClose();
        })
        .catch((error)=>
          {
            toast({
              title: "Transaction error.",
              description: error.message,
              status: "error",
              duration: MODAL_DURATION.ERROR,
              position: "top-right",
              isClosable: true,
            });
          });
  }

  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader textAlign={'center'} fontWeight={700}>New Lock Position</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <HStack spacing={10}>
                  <InputGroup  colorScheme={colors.primary} size='lg'>
                    <InputLeftAddon bg={'#efefef'}> 
                          <Square minW="30px">
                            <Image
                              boxSize="20px"
                              objectFit="cover"
                              src="/meta_black.png"
                              alt="stnear"
                            />
                          </Square>
                    </InputLeftAddon>
                    <Input
                        autoFocus={true}
                        id="amount_lock"
                        name="amount_lock"
                        type="number"
                        bg={'#efefef'}
                        colorScheme={colors.primary} 
                        value={formikLock.values.amount_lock||""}
                        onPaste={(e)=> inputChange(e)}
                        onBlur={(e)=> inputChange(e, true)}
                        onChange={(e)=> inputChange(e)}
                    ></Input>
                    <InputRightAddon bg={'#efefef'}>
                      <Button colorScheme={colors.primary} borderRadius={100} color={'white'}  h='1.75rem' size='sm' onClick={()=>maxButtonClicked()}>
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
              <Stack spacing={5} w={'100%'} direction={{base:'column', md:'column'}} justify={'space-between'}>
                <HStack align={{base:'flex-start', md:'flex-end'}} justify={'space-between'}>
                  <HStack>
                    <Image boxSize="16px" alt={'lock-icon'} src={'./icons/check_bold.png'}></Image>
                    <Text fontWeight={500} fontSize={'16px'}   > Voting Power</Text>

                  </HStack>
                  <Text fontWeight={700} fontFamily={'Meta Space'} fontSize={'16px'}  > { vPowerSim.toFixed(5)} </Text>
                </HStack>

                <Slider  defaultValue={sliderValue} min={MIN_LOCK_DAYS} max={MAX_LOCK_DAYS} step={15} onChange={(val) => setSliderValue(val)}>
                  <SliderTrack >
                    <Box position='relative' right={10} />
                    <SliderFilledTrack  bg={colors.primary +'.500'} />
                  </SliderTrack>
                  <SliderThumb bg={colors.primary+'.500'} boxSize={6} />
                </Slider>
                
                <HStack align={{base:'flex-start', md:'flex-Start'}} justify={'space-between'}>
                  <HStack >
                    <Image boxSize="16px" alt={'lock-icon'} src={'./icons/lock_bold.png'}></Image>
                    <HStack>                    
                      <Text fontWeight={500} fontSize={'16px'} >AutoLock days </Text> 
                      <Text hidden={true} fontWeight={700} color={'green.500'}>( + {((getMultiplierPerDays(sliderValue) - 1)*100).toFixed(2)} % )</Text>

                    </HStack>
                  </HStack>
                  <Text fontWeight={700} fontFamily={'Meta Space'} fontSize={'16px'} >{sliderValue} days</Text> 
                </HStack>
              </Stack>
            </VStack>
          </ModalBody>
          <ModalFooter mt={10}>
            <Flex  w={'100%'} direction={{base: 'column', md: 'row'}} justifyContent={'flex-end'}>
              <Button borderRadius={100} variant='outline'  m={1} onClick={onClose}>
                Cancel
              </Button>
              <Button borderRadius={100} colorScheme={colors.primary} px={70} onClick={(e: any) => formikLock.handleSubmit(e)}  m={1}>Lock</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default LockModal;
