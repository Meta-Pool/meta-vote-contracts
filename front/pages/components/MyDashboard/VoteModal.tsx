import {
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
  VStack,
  StackDivider,
  HStack,
  useToast
} from '@chakra-ui/react';
import React from 'react';
import { colors } from '../../../constants/colors';
import { voteProject } from '../../../lib/near';
import { useFormik } from 'formik';
import { ntoy, yton } from '../../../lib/util';
import voteValidation from '../../../validation/votesValidation';
import { useStore as useVoter } from "../../../stores/voter";


type Props = {
  wallet: any,
  isOpen: any, 
  onClose: any,
  id: string,
  contractAdress: string,
}

const VoteModal = (props: Props) => {
  const { voterData } = useVoter();

  const {wallet, isOpen, onClose, id, contractAdress} = props;
  const toast = useToast();

  const initialValuesDeposit: any = {
    amount_vote: 0
  };

  const formikLock = useFormik({
    initialValues: initialValuesDeposit,
    validationSchema: voteValidation,
    validateOnMount: true,
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values: any) => {
      if (values.amount_vote < 1) {
        // show toast error
        toast({
          title: "Transaction error.",
          description: "The amount to vote must be greater than 0",
          status: "error",
          duration: 9000,
          position: "top-right",
          isClosable: true,
        });
      } else {
        try {
          voteProject(id, contractAdress, ntoy(formikLock.values.amount_vote), wallet);
        }
        catch (error: any) {
          console.error(error);
          toast({
            title: "Transaction error.",
            description: error,
            status: "error",
            duration: 9000,
            position: "top-right",
            isClosable: true,
          });
        } 
      }
    },
  });


  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Vote</ModalHeader>
          <ModalCloseButton/>
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <Text fontSize={'xs'}>Voting power available: {yton(voterData.votingPower)}</Text>
              <HStack spacing={10}>
                  <Text fontSize={'sm'}>Amount to vote:</Text>
                  <InputGroup colorScheme={colors.primary} size='sm'>
                    <InputLeftAddon> $META</InputLeftAddon>
                    <Input
                        id="amount_vote"
                        name="amount_vote"
                        w={40}
                        colorScheme={colors.primary} 
                        value={formikLock.values.amount_vote}
                        onPaste={formikLock.handleChange}
                        onBlur={formikLock.handleBlur}
                        onChange={formikLock.handleChange}
                    ></Input>
                    {/*<InputRightAddon>
                      <Button h='1.75rem' size='sm'>
                        Max
                      </Button>
                    </InputRightAddon>  */}
                    </InputGroup>
              </HStack>
              
              <StackDivider></StackDivider >
              </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant='ghost' mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={colors.primary} onClick={(e: any) => formikLock.handleSubmit(e)}>Confirm Vote</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default VoteModal;


