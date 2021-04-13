import { Button, createStandaloneToast, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import Player from '../../classes/Player';

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
      title: `${senderPlayer.userName} has invited you to race (game will be auto-rejected after 20 seconds)`,
      description: acceptRejectButtons,
      duration: 20000,
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
    duration: 3000,
    isClosable: true,
  });
}

export function displayMazeFullGameResponseToast(): void {
  const toastTitle = `Unable to send invite, the maze is full`;
  const toast = createStandaloneToast();
  toast({
    title: toastTitle,
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
}

export function displayInviteSentToast(recipientPlayer: Player): void {
  const TOAST_ID = recipientPlayer.id;
  const toastTitle = `Invited ${recipientPlayer.userName} to race`;
  const toast = createStandaloneToast();

  if (!toast.isActive(TOAST_ID)) {
    toast({
      id: TOAST_ID,
      title: toastTitle,
      status: 'info',
      duration: null,
      isClosable: true,
    });
  }
}
