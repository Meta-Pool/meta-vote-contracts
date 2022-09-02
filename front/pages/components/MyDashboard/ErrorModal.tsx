import {
  Text, 
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton, 
  VStack,
  StackDivider,
  ModalFooter,
  Flex,
  Button,
} from '@chakra-ui/react';
import React from 'react';

export interface InfoContent {
  title: string,
  text: string
}

type Props = {
  content: InfoContent,
  isOpen: any, 
  onClose: any,
}

const ErrorModal = (props: Props) => {
  const { content, isOpen, onClose} = props;

  return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent >
          <ModalHeader textAlign={'center'} fontSize={'24px'}  fontWeight={700}>{content?.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align={'flex-start'}>
              <StackDivider></StackDivider >
              <Text fontWeight={400}  fontSize={'16px'} dangerouslySetInnerHTML={{__html: content?.text}}></Text>
            </VStack>
          </ModalBody>
          <ModalFooter mt={10}>
            <Flex  w={'100%'} direction={{base: 'column', md: 'row'}} justifyContent={'flex-end'}>
              <Button borderRadius={100} variant='outline'  m={1} onClick={onClose}>
                Ok
              </Button>
            </Flex>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
};

export default ErrorModal;
