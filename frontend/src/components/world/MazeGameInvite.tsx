import { Button, SimpleGrid, useToast } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

export default function MazeGameInvite(): JSX.Element {
  const INVITING_PLAYER = 'player1'; // TODO: This is just a placeholder, remove when invite logic gets added
  const TOAST_ID = 'invite_player';
  const toast = useToast();

  function acceptRace() {
    toast.close(TOAST_ID);
    // TODO: add logic to start game
  }

  function rejectRace() {
    toast.close(TOAST_ID);
    toast({
      title: 'Race rejected',
      description: 'Maybe next time :(',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
    // TODO: add logic to inform other player that the race has been rejected
  }

  function makeButtons(): ReactNode {
    return (
      <>
        <SimpleGrid columns={2} spacing={10}>
          <Button colorScheme='blackAlpha' onClick={acceptRace}>
            accept
          </Button>
          <Button colorScheme='whiteAlpha' onClick={rejectRace}>
            reject
          </Button>
        </SimpleGrid>
      </>
    );
  }

  // TODO: currently using a button to show the toast message, remove when invite logic gets added
  return (
    <Button
      onClick={() =>
        toast({
          id: TOAST_ID,
          title: `${INVITING_PLAYER} has invited you to race, accept?`,
          description: makeButtons(),
          duration: null,
        })
      }>
      Show Toast
    </Button>
  );
}
