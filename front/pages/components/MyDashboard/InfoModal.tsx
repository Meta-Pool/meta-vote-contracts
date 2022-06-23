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
            <Flex  w={'100%'} direction={{base: 'column', md: 'row'}} justifyContent={'center'}>
              <Button colorScheme={colors.secundary} onClick={onSubmit}  m={1}>Yep</Button>
              <Button variant='outline' color={'white'} bg={'purple.900'} _hover={{ bg: 'grey' }} m={1} onClick={onClose}>
                Cancel
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default InfoModal;
