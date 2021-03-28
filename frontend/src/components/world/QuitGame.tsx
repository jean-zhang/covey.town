import React, { ReactNode } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button, UseDisclosureProps } from '@chakra-ui/react';

export default function QuitGame(props: UseDisclosureProps): JSX.Element {
    const { isOpen } = props;
    return (
        <>
            <Modal isOpen={isOpen || false} onClose={() => console.log('close')} >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Quit the Corn Maze</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to quit? You will not be able to submit a score for this run.
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline">
                            Resume
                        </Button>
                        <Button colorScheme="red">
                            Quit
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
