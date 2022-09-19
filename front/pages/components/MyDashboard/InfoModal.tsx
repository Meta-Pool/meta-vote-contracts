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
  VStack,
  StackDivider,
  Flex
} from '@chakra-ui/react';
import React from 'react';
import { colors } from '../../../constants/colors';

export interface InfoContent {
  title: string,
  text: string
}

type Props = {
  content: InfoContent,
  isOpen: any, 
  onClose: any,
  onSubmit: any,
}

const InfoModal = (props: Props) => {
  const { content, isOpen, onClose, onSubmit} = props;

  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent >
          <ModalHeader textAlign={'center'} fontSize={'24px'}  fontWeight={700}>{content?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <StackDivider></StackDivider >
              <Text fontWeight={400}  fontSize={'16px'}>{content?.text}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter mt={10}>
            <Flex  w={'100%'} direction={{base: 'column', md: 'row'}} justifyContent={'flex-end'}>
              <Button borderRadius={100} variant='outline'  m={1} onClick={onClose}>
                Cancel
              </Button>
              <Button borderRadius={100} colorScheme={colors.primary} px={20} onClick={onSubmit}  m={1}>Yes</Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default InfoModal;
