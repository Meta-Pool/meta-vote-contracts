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
  Image
} from '@chakra-ui/react';
import React, {  useState } from 'react';
import { colors } from '../../../constants/colors';
import { lock } from '../../../lib/near';
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { ntoy } from '../../../lib/util';


type Props = {
  wallet: any,
  isOpen: any, 
  onClose: any,
  vPower: string
}

const StatusTag = (props: Props) => {
  const {wallet, isOpen, onClose, vPower} = props;
  const [ sliderValue, setSliderValue] = useState(30);

  const initialValuesDeposit: any = {
    amount_lock: 0
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
    },
  });
  
  const lockMetas = (values: any)=> {
    try {
      lock( sliderValue.toString(), ntoy(formikLock.values.amount_lock));
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
                        colorScheme={colors.primary} 
                        value={formikLock.values.amount_lock}
                        onPaste={formikLock.handleChange}
                        onBlur={formikLock.handleBlur}
                        onChange={formikLock.handleChange}
                    ></Input>
                    <InputRightAddon>
                      <Button bg={'black'} color={'white'} h='1.75rem' size='sm'>
                        Max
                      </Button>
                    </InputRightAddon>  
                  </InputGroup>
              </HStack>
              
              <StackDivider></StackDivider >
              <Slider defaultValue={30} min={0} max={120} step={15} onChange={(val) => setSliderValue(val)}>
                <SliderTrack bg={colors.primary + '.200'}>
                  <Box position='relative' right={10} />
                  <SliderFilledTrack bg={colors.primary +'.500'} />
                </SliderTrack>
                <SliderThumb bg={colors.primary+'.500'} boxSize={6} />
              </Slider>
              <HStack><Text fontWeight={200} fontSize={'xl'} color={'indigo.500'}>AutoLock days:</Text> <Text fontWeight={500} fontSize={'xl'} color={'white'}>{sliderValue}</Text> </HStack>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={colors.primary} onClick={(e: any) => formikLock.handleSubmit(e)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default StatusTag;
