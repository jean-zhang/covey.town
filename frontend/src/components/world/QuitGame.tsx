import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, Button } from '@chakra-ui/react';

interface QuitGameProps {
    isOpen: boolean,
    onClose: () => void,
    onQuit: () => void,
}

export default function QuitGame(props: QuitGameProps): JSX.Element {
    const { isOpen, onClose, onQuit } = props;
    return (
        <>
            <Modal isOpen={isOpen || false} onClose={() => onClose()} >
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Quit the Corn Maze</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Are you sure you want to quit? You will not be able to submit a score for this run.
                    </ModalBody>

                    <ModalFooter>
                        <Button variant="outline" onClick={() => onClose()}>
                            Resume
                        </Button>
                        <Button colorScheme="red" onClick={() => onQuit()}>
                            Quit
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}
