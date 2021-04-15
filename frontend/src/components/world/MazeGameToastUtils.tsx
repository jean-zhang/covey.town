import { Button, createStandaloneToast, Heading, SimpleGrid, Text } from '@chakra-ui/react';
import React from 'react';
import Player from '../../classes/Player';

export const AUTO_REJECT_GAME_SECONDS = 20;
export const TEMPORARY_TOAST_DURATION_SECONDS = 3;

export function displayMazeGameInviteToast(
  senderPlayer: Player,
  onGameResponse: (gameAcceptance: boolean) => void,
): void {
  const TOAST_ID = senderPlayer.id;
  const toast = createStandaloneToast();

  function onToastResponse(gameAcceptance: boolean) {
    onGameResponse(gameAcceptance);
    toast.close(TOAST_ID);
  }

  const toastTitle = (
    <>
      <Heading size='sm'>{`${senderPlayer.userName} has invited you to race`}</Heading>
      <Text fontSize='sm'>Auto-rejection after 20 seconds</Text>
    </>
  );

  const acceptRejectButtons = (
    <SimpleGrid columns={2} spacing={10}>
      <Button colorScheme='blackAlpha' onClick={() => onToastResponse(true)}>
        Accept
      </Button>
      <Button colorScheme='whiteAlpha' onClick={() => onToastResponse(false)}>
        Reject
      </Button>
    </SimpleGrid>
  );

  if (!toast.isActive(TOAST_ID)) {
    toast({
      id: TOAST_ID,
      title: toastTitle,
      description: acceptRejectButtons,
      duration: AUTO_REJECT_GAME_SECONDS * 1000,
    });
  }
}

export function displayMazeGameResponseToast(recipientPlayer: Player, gameResponse: boolean): void {
  const acceptRejectString = gameResponse ? 'accepted' : 'rejected';
  const toastTitle = `${recipientPlayer.userName} ${acceptRejectString} your game invite`;
  const toast = createStandaloneToast();
  toast.close(recipientPlayer.id);
  toast({
    title: toastTitle,
    status: 'info',
    duration: TEMPORARY_TOAST_DURATION_SECONDS * 1000,
    isClosable: true,
  });
}

export function displayPlayerFinishedToast(
  finishedPlayer: Player,
  score: number,
  gaveUp: boolean,
): void {
  const toastTitle = gaveUp
    ? `${finishedPlayer.userName} has given up and left the maze`
    : `${finishedPlayer.userName} has completed the maze!`;
  const toastDescription = gaveUp || score <= 0 ? undefined : `Score is ${score / 1000}s`;
  const duration = gaveUp ? 3000 : 6000;
  const toast = createStandaloneToast();
  toast({
    title: toastTitle,
    description: toastDescription,
    status: 'info',
    duration,
    isClosable: true,
  });
}

export function displayMazeFullGameResponseToast(): void {
  const toastTitle = `Unable to send invite, the maze is full`;
  const toast = createStandaloneToast();
  toast({
    title: toastTitle,
    status: 'info',
    duration: TEMPORARY_TOAST_DURATION_SECONDS * 1000,
    isClosable: true,
  });
}

export function displayInviteSentToast(recipientPlayer: Player): void {
  const toast = createStandaloneToast();
  const TOAST_ID = recipientPlayer.id;
  const toastTitle = `Invited ${recipientPlayer.userName} to race`;

  if (!toast.isActive(TOAST_ID)) {
    toast({
      id: TOAST_ID,
      title: toastTitle,
      description: 'Game invites auto-reject after 20 seconds',
      status: 'info',
      duration: null,
      isClosable: true,
    });
  }
}
