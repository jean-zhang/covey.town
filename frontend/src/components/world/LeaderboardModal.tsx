import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import React from 'react';
import { MazeCompletionInfo } from '../../classes/TownsServiceClient';

export default function LeaderboardModal(props: {
  isOpen: boolean;
  onClose: () => void;
  leaderboardData: MazeCompletionInfo[];
}): JSX.Element {
  const { isOpen, onClose, leaderboardData } = props;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size='4xl'>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Corn Maze Leaderboard</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Table variant='simple' size='sm'>
            <Thead>
              <Tr>
                <Th>Player ID</Th>
                <Th>Username</Th>
                <Th isNumeric>Completion Time (seconds)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaderboardData.map(row => (
                <Tr key={row.playerID}>
                  <Td>{row.playerID}</Td>
                  <Td>{row.username}</Td>
                  <Td isNumeric>{row.time}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme='blue' mr={3} onClick={onClose}>
            Ok!
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
