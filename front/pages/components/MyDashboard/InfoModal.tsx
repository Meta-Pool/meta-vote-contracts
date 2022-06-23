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
        <ModalContent bg={'purple.900'}>
          <ModalHeader textAlign={'center'} color={'white'} fontWeight={500}>{content?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <StackDivider></StackDivider >
              <Text fontWeight={400} color={'white'} fontSize={'sm'}>{content?.text}</Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Flex  w={'100%'} justifyContent={'space-evenly'}>
              <Button colorScheme={colors.secundary} onClick={onSubmit}>Yep</Button>
              <Button variant='outline' color={'white'} bg={'purple.900'} _hover={{ bg: 'grey' }} mr={3} onClick={onClose}>
                Cancel
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default InfoModal;
