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

const DISPLAY_CUTOFF = 20;

export default function LeaderboardModal(props: {
  isOpen: boolean;
  onClose: () => void;
  leaderboardData: MazeCompletionInfo[];
}): JSX.Element {
  const { isOpen, onClose, leaderboardData } = props;
  const leaderboardDataToDisplay = leaderboardData.slice(0, DISPLAY_CUTOFF);

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
                <Th />
                <Th>Player ID</Th>
                <Th>Username</Th>
                <Th isNumeric>Completion Time (seconds)</Th>
              </Tr>
            </Thead>
            <Tbody>
              {leaderboardDataToDisplay.map((row, index) => (
                <Tr key={row.playerID}>
                  <Td>{`${index + 1}.`}</Td>
                  <Td>{row.playerID}</Td>
                  <Td>{row.username}</Td>
                  <Td isNumeric>{row.time / 1000}</Td>
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
