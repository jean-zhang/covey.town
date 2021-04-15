import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Button, Text, ModalFooter } from '@chakra-ui/react';

export default function Instructions(props: {isOpen: boolean, onClose: () => void}): JSX.Element {
    const { isOpen, onClose } = props;
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
            <ModalContent>
                <ModalHeader>Welcome!</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                <Text color="gray.500">
                    Find your way out of the corn maze before your opponent does! 
                    The timer will start once you click ok. 

                    Once you finish the maze, press space while standing next to the blue sign in town to check the leaderboards.
                </Text>
                </ModalBody>
                <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={onClose}>
                    Ok!
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
    )
  }
