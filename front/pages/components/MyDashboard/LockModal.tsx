import {
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
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
  VStack,
  StackDivider,
  toast,
  HStack
} from '@chakra-ui/react';
import React, {  useState } from 'react';
import { colors } from '../../../constants/colors';
import {  lock } from '../../../lib/near';
import { useStore as useVoter } from "../../../stores/voter";
import { useFormik } from 'formik';
import lockValidation from '../../../validation/lockValidation';
import { ntoy, yton } from '../../../lib/util';

type Props = {
  wallet: any,
  isOpen: any, 
  onClose: any,
  vPower: string
}

const LockModal = (props: Props) => {
  const {wallet, isOpen, onClose, vPower} = props;
  const [ sliderValue, setSliderValue] = useState(30);
  const { voterData, setVoterData } = useVoter();


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
      lock( sliderValue.toString(), ntoy(formikLock.values.amount_lock), wallet);
    }
    catch (error) {
      console.error(error);
    } 
  }

  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Lock Position</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <Text fontSize={'xs'}>Voting power available: {yton(vPower)}</Text>
              <HStack spacing={10}>
                  <Text fontSize={'sm'}>Amount to lock:</Text>
                  <InputGroup colorScheme={colors.primary} size='sm'>
                    <InputLeftAddon> $META</InputLeftAddon>
                    <Input
                        id="amount_lock"
                        name="amount_lock"
                        w={40}
                        colorScheme={colors.primary} 
                        value={formikLock.values.amount_lock}
                        onPaste={formikLock.handleChange}
                        onBlur={formikLock.handleBlur}
                        onChange={formikLock.handleChange}
                    ></Input>
                    <InputRightAddon>
                      <Button h='1.75rem' size='sm'>
                        Max
                      </Button>
                    </InputRightAddon>  
                  </InputGroup>
              </HStack>
              
              <StackDivider></StackDivider >
              <Slider defaultValue={15} min={30} max={120} step={15} onChange={(val) => setSliderValue(val)}>
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
            <Button colorScheme={colors.primary} onClick={(e: any) => formikLock.handleSubmit(e)}>Confirm</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default LockModal;
