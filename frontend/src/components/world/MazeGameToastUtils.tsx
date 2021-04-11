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
      title: `${senderPlayer.userName} has invited you to race, accept?`,
      description: acceptRejectButtons,
      duration: null,
    });
  }
}

export function displayMazeGameResponseToast(recipientPlayer: Player, gameResponse: boolean): void {
  const acceptRejectString = gameResponse ? 'accepted' : 'rejected';
  const toastTitle = `${recipientPlayer.userName} ${acceptRejectString} your game invite`;
  const toast = createStandaloneToast();
  toast({
    title: toastTitle,
    status: 'info',
    duration: 3000,
    isClosable: true,
  });
}

export function displayPlayerFinishedToast(finishedPlayer: Player, score: number, gaveUp: boolean): void {
  const toastTitle = gaveUp? `${finishedPlayer.userName} has given up and left the maze` : `${finishedPlayer.userName} has completed the maze!`;
  const toastDescription = (gaveUp || score <= 0)? undefined : `Score is ${score}`;
  const toast = createStandaloneToast();
  toast({
    title: toastTitle,
    description: toastDescription,
    status: 'info',
    duration: 3000,
    isClosable:true
  })
}
