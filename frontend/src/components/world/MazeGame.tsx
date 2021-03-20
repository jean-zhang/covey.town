import React, { ReactNode } from 'react';
import { Box, useToast, Button, RenderProps, SimpleGrid } from '@chakra-ui/react';

export default function MazeGame(): JSX.Element {
  const INVITING_PLAYER = 'player1'; // TODO: This is just a placeholder, remove when invite logic gets added
  const toast = useToast();

  function renderToast(renderProp: RenderProps): ReactNode {
    function acceptRace() {
      renderProp.onClose();
      // TODO: add logic to start game
    }
  
    function rejectRace() {
      renderProp.onClose();
      toast({
        title: "Race rejected",
        description: "Maybe next time :(",
        status: "info",
        duration: 2000,
        isClosable: true
      });
      // TODO: add logic to inform other player that the race has been rejected
    }

    return (<Box color="white" p={3} bg="cyan.500">
              {INVITING_PLAYER} has invited you to race, accept?
              <div>
                <SimpleGrid columns={2} spacing={10}>
                  <Button colorScheme="blackAlpha" onClick={acceptRace}>accept</Button>
                  <Button colorScheme="whiteAlpha" onClick={rejectRace}>reject</Button>
                </SimpleGrid>
              </div>
            </Box>);
  }

  // TODO: currently using a button to show the toast message, remove when invite logic gets added
  return (
    <Button
      onClick={() =>
        toast({
          title: "Account created.",
          description: "We've created your account for you.",
          status: "success",
          render: renderToast,
          duration: null,
          isClosable: true,
        })
      }
    >
      Show Toast
    </Button>
  )
}
