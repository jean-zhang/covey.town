import { mock, mockReset } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import * as TestUtils from '../client/TestUtils';
import { UserLocation } from '../CoveyTypes';
import { townSubscriptionHandler } from '../requestHandlers/CoveyTownRequestHandlers';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import CoveyTownController from './CoveyTownController';
import CoveyTownsStore from './CoveyTownsStore';
import TwilioVideo from './TwilioVideo';

jest.mock('./TwilioVideo');

const mockGetTokenForTown = jest.fn();
// eslint-disable-next-line
// @ts-ignore it's a mock
TwilioVideo.getInstance = () => ({
  getTokenForTown: mockGetTokenForTown,
});

function generateTestLocation(): UserLocation {
  return {
    rotation: 'back',
    moving: Math.random() < 0.5,
    x: Math.floor(Math.random() * 100),
    y: Math.floor(Math.random() * 100),
  };
}

describe('CoveyTownController', () => {
  beforeEach(() => {
    mockGetTokenForTown.mockClear();
  });
  it('constructor should set the friendlyName property', () => {
    // Included in handout
    const townName = `FriendlyNameTest-${nanoid()}`;
    const townController = new CoveyTownController(townName, false);
    expect(townController.friendlyName).toBe(townName);
  });
  describe('addPlayer', () => {
    // Included in handout
    it('should use the coveyTownID and player ID properties when requesting a video token', async () => {
      const townName = `FriendlyNameTest-${nanoid()}`;
      const townController = new CoveyTownController(townName, false);
      const newPlayerSession = await townController.addPlayer(new Player(nanoid()));
      expect(mockGetTokenForTown).toBeCalledTimes(1);
      expect(mockGetTokenForTown).toBeCalledWith(
        townController.coveyTownID,
        newPlayerSession.player.id,
      );
    });
  });
  describe('town listeners and events', () => {
    let testingTown: CoveyTownController;
    const mockListeners = [
      mock<CoveyTownListener>(),
      mock<CoveyTownListener>(),
      mock<CoveyTownListener>(),
    ];
    const mockCoveyListenerFns = jest.fn();
    const mockOnMazeGameRequested1 = jest.fn();
    const mockMazeGameResponded1 = jest.fn();
    const mockOnFinishGame1 = jest.fn();
    const mockOnFullMazeGameRequested1 = jest.fn();
    const mockOnUpdatePlayerRaceSettings1 = jest.fn();
    function mockCoveyListener1WithId(id: string): CoveyTownListener {
      return {
        listeningPlayerID: id,
        onPlayerDisconnected(removedPlayer: Player): void {
          mockCoveyListenerFns(removedPlayer);
        },
        onPlayerMoved(movedPlayer: Player): void {
          mockCoveyListenerFns(movedPlayer);
        },
        onTownDestroyed() {
          mockCoveyListenerFns();
        },
        onPlayerJoined(newPlayer: Player) {
          mockCoveyListenerFns(newPlayer);
        },
        onMazeGameRequested(senderPlayer: Player, recipientPlayer: Player) {
          mockOnMazeGameRequested1(senderPlayer, recipientPlayer);
        },
        onMazeGameResponded(senderPlayer: Player, recipientPlayer: Player, gameAcceptance: boolean) {
          mockMazeGameResponded1(senderPlayer, recipientPlayer, gameAcceptance);
        },
        onFinishGame(finishedPlayer: Player, partnerPlayer: Player, score: number, gaveUp: boolean) {
          mockOnFinishGame1(finishedPlayer, partnerPlayer, score, gaveUp);
        },
        onFullMazeGameRequested(senderPlayer: Player) {
          mockOnFullMazeGameRequested1(senderPlayer);
        },
        onUpdatePlayerRaceSettings(senderPlayer: Player) {
          mockOnUpdatePlayerRaceSettings1(senderPlayer);
        },
      };
    }
    const mockOnMazeGameRequested2 = jest.fn();
    const mockMazeGameResponded2 = jest.fn();
    const mockOnFinishGame2 = jest.fn();
    const mockOnFullMazeGameRequested2 = jest.fn();
    const mockOnUpdatePlayerRaceSettings2 = jest.fn();
    function mockCoveyListener2WithId(id: string): CoveyTownListener {
      return {
        listeningPlayerID: id,
        onPlayerDisconnected(removedPlayer: Player): void {
          mockCoveyListenerFns(removedPlayer);
        },
        onPlayerMoved(movedPlayer: Player): void {
          mockCoveyListenerFns(movedPlayer);
        },
        onTownDestroyed() {
          mockCoveyListenerFns();
        },
        onPlayerJoined(newPlayer: Player) {
          mockCoveyListenerFns(newPlayer);
        },
        onMazeGameRequested(senderPlayer: Player, recipientPlayer: Player) {
          mockOnMazeGameRequested2(senderPlayer, recipientPlayer);
        },
        onMazeGameResponded(senderPlayer: Player, recipientPlayer: Player, gameAcceptance: boolean) {
          mockMazeGameResponded2(senderPlayer, recipientPlayer, gameAcceptance);
        },
        onFinishGame(finishedPlayer: Player, partnerPlayer: Player, score: number, gaveUp: boolean) {
          mockOnFinishGame2(finishedPlayer, partnerPlayer, score, gaveUp);
        },
        onFullMazeGameRequested(senderPlayer: Player) {
          mockOnFullMazeGameRequested2(senderPlayer);
        },
        onUpdatePlayerRaceSettings(senderPlayer: Player) {
          mockOnUpdatePlayerRaceSettings2(senderPlayer);
        },
      };
    }
    const mockFunctions = [
      mockOnMazeGameRequested1, mockMazeGameResponded1, mockOnFinishGame1, 
      mockOnFullMazeGameRequested1, mockOnUpdatePlayerRaceSettings1,
      mockOnMazeGameRequested2, mockMazeGameResponded2, mockOnFinishGame2, 
      mockOnFullMazeGameRequested2, mockOnUpdatePlayerRaceSettings2,
    ];
    beforeEach(() => {
      const townName = `town listeners and events tests ${nanoid()}`;
      testingTown = new CoveyTownController(townName, false);
      mockListeners.forEach(mockReset);
      mockFunctions.forEach(mockReset);
    });
    it('should notify added listeners of player movement when updatePlayerLocation is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);
      const newLocation = generateTestLocation();
      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.updatePlayerLocation(player, newLocation);
      mockListeners.forEach(listener => expect(listener.onPlayerMoved).toBeCalledWith(player));
    });
    it('should notify added listeners of player disconnections when destroySession is called', async () => {
      const player = new Player('test player');
      const session = await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.destroySession(session);
      mockListeners.forEach(listener =>
        expect(listener.onPlayerDisconnected).toBeCalledWith(player),
      );
    });
    it('should notify added listeners of new players when addPlayer is called', async () => {
      mockListeners.forEach(listener => testingTown.addTownListener(listener));

      const player = new Player('test player');
      await testingTown.addPlayer(player);
      mockListeners.forEach(listener => expect(listener.onPlayerJoined).toBeCalledWith(player));
    });
    it('should notify added listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.disconnectAllPlayers();
      mockListeners.forEach(listener => expect(listener.onTownDestroyed).toBeCalled());
    });
    it('should not notify removed listeners of player movement when updatePlayerLocation is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const newLocation = generateTestLocation();
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.updatePlayerLocation(player, newLocation);
      expect(listenerRemoved.onPlayerMoved).not.toBeCalled();
    });
    it('should not notify removed listeners of player disconnections when destroySession is called', async () => {
      const player = new Player('test player');
      const session = await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.destroySession(session);
      expect(listenerRemoved.onPlayerDisconnected).not.toBeCalled();
    });
    it('should not notify removed listeners of new players when addPlayer is called', async () => {
      const player = new Player('test player');

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      const session = await testingTown.addPlayer(player);
      testingTown.destroySession(session);
      expect(listenerRemoved.onPlayerJoined).not.toBeCalled();
    });

    it('should not notify removed listeners that the town is destroyed when disconnectAllPlayers is called', async () => {
      const player = new Player('test player');
      await testingTown.addPlayer(player);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      const listenerRemoved = mockListeners[1];
      testingTown.removeTownListener(listenerRemoved);
      testingTown.disconnectAllPlayers();
      expect(listenerRemoved.onTownDestroyed).not.toBeCalled();
    });

    it('should notify only players involved when a player tries to start a game', async () => {
      const player1 = new Player('test player1');
      const player2 = new Player('test player2');
      await testingTown.addPlayer(player1);
      await testingTown.addPlayer(player2);
      const mockListener1 = mockCoveyListener1WithId(player1.id);
      const mockListener2 = mockCoveyListener2WithId(player2.id);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.addTownListener(mockListener1);
      testingTown.addTownListener(mockListener2);

      testingTown.onGameRequested(player1.id, player2.id);
      expect(mockOnMazeGameRequested1).toBeCalledWith(player1, player2);
      expect(mockOnMazeGameRequested2).toBeCalledWith(player1, player2);
      mockListeners.forEach(listener => expect(listener.onMazeGameRequested).not.toBeCalled());
    });

    it('should notify invite sender when maze has reached capacity', async () => {
      const player1 = new Player('test player1');
      const player2 = new Player('test player2');
      await testingTown.addPlayer(player1);
      await testingTown.addPlayer(player2);
      const mockListener1 = mockCoveyListener1WithId(player1.id);
      const mockListener2 = mockCoveyListener2WithId(player2.id);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.addTownListener(mockListener1);
      testingTown.addTownListener(mockListener2);

      const addPlayerPromises: Promise<PlayerSession> [] = [];
      for (let i = 0; i < 5; i+=1) {
        const player1ToAddToGame = new Player(`testGamePlayer${i}a`);
        const player2ToAddToGame = new Player(`testGamePlayer${i}b`);
        addPlayerPromises.push(testingTown.addPlayer(player1ToAddToGame));
        addPlayerPromises.push(testingTown.addPlayer(player2ToAddToGame));
      }
      const playerSessions = await Promise.all(addPlayerPromises);
      for (let i = 0; i < 5; i+=1) {
        const player1 = playerSessions[2*i].player;
        const player2 = playerSessions[2*i + 1].player;
        testingTown.respondToGameInvite(player1.id, player2.id, true); 
      }
      testingTown.onGameRequested(player1.id, player2.id);
      expect(mockOnFullMazeGameRequested1).toBeCalledWith(player1);
      expect(mockOnMazeGameRequested1).not.toBeCalled();
      expect(mockOnMazeGameRequested2).not.toBeCalled();
      expect(mockOnFullMazeGameRequested2).not.toBeCalled();
      mockListeners.forEach(listener => expect(listener.onFullMazeGameRequested).not.toBeCalled());
    });

    it('should notify both players when a game request has been accepted or rejected', async () => {
      const player1 = new Player('test player1');
      const player2 = new Player('test player2');
      await testingTown.addPlayer(player1);
      await testingTown.addPlayer(player2);
      const mockListener1 = mockCoveyListener1WithId(player1.id);
      const mockListener2 = mockCoveyListener2WithId(player2.id);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.addTownListener(mockListener1);
      testingTown.addTownListener(mockListener2);

      // accept
      testingTown.respondToGameInvite(player1.id, player2.id, true);

      expect(mockMazeGameResponded1).toBeCalledWith(player1, player2, true);
      expect(mockMazeGameResponded2).toBeCalledWith(player1, player2, true);
      mockListeners.forEach(listener => expect(listener.onMazeGameResponded).not.toBeCalled());

      // reject
      testingTown.respondToGameInvite(player1.id, player2.id, false);

      expect(mockMazeGameResponded1).toBeCalledWith(player1, player2, false);
      expect(mockMazeGameResponded2).toBeCalledWith(player1, player2, false);
      mockListeners.forEach(listener => expect(listener.onMazeGameResponded).not.toBeCalled());
    });

    it('should notify all players when a player finishes a game', async () => {
      const score = 100;
      const player1 = new Player('test player1');
      const player2 = new Player('test player2');
      await testingTown.addPlayer(player1);
      await testingTown.addPlayer(player2);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      testingTown.respondToGameInvite(player1.id, player2.id, true);
      // finish case
      await testingTown.playerFinish(player1.id, score, false);
      mockListeners.forEach(listener => expect(listener.onFinishGame).toBeCalledWith(player1, player2, score, false));
      // give up case
      await testingTown.playerFinish(player2.id, -1, true);
      mockListeners.forEach(listener => expect(listener.onFinishGame).toBeCalledWith(player2, player1, -1, true));
    });

    it('should notify all players when a player has changed their invite settings', async () => {
      const player1 = new Player('test');
      await testingTown.addPlayer(player1);

      mockListeners.forEach(listener => testingTown.addTownListener(listener));
      // toggle true
      testingTown.updatePlayerRaceSettings(player1.id, true);
      mockListeners.forEach(listener => expect(listener.onUpdatePlayerRaceSettings).toBeCalledWith(player1, true));
      
      // toggle false
      testingTown.updatePlayerRaceSettings(player1.id, false);
      mockListeners.forEach(listener => expect(listener.onUpdatePlayerRaceSettings).toBeCalledWith(player1, false));
    });
  });
  describe('townSubscriptionHandler', () => {
    const mockSocket = mock<Socket>();
    let testingTown: CoveyTownController;
    let player: Player;
    let session: PlayerSession;
    beforeEach(async () => {
      const townName = `connectPlayerSocket tests ${nanoid()}`;
      testingTown = CoveyTownsStore.getInstance().createTown(townName, false);
      mockReset(mockSocket);
      player = new Player('test player');
      session = await testingTown.addPlayer(player);
    });
    it('should reject connections with invalid town IDs by calling disconnect', async () => {
      TestUtils.setSessionTokenAndTownID(nanoid(), session.sessionToken, mockSocket);
      townSubscriptionHandler(mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    it('should reject connections with invalid session tokens by calling disconnect', async () => {
      TestUtils.setSessionTokenAndTownID(testingTown.coveyTownID, nanoid(), mockSocket);
      townSubscriptionHandler(mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    describe('with a valid session token', () => {
      it('should add a town listener, which should emit "newPlayer" to the socket when a player joins', async () => {
        TestUtils.setSessionTokenAndTownID(
          testingTown.coveyTownID,
          session.sessionToken,
          mockSocket,
        );
        townSubscriptionHandler(mockSocket);
        await testingTown.addPlayer(player);
        expect(mockSocket.emit).toBeCalledWith('newPlayer', player);
      });
      it('should add a town listener, which should emit "playerMoved" to the socket when a player moves', async () => {
        TestUtils.setSessionTokenAndTownID(
          testingTown.coveyTownID,
          session.sessionToken,
          mockSocket,
        );
        townSubscriptionHandler(mockSocket);
        testingTown.updatePlayerLocation(player, generateTestLocation());
        expect(mockSocket.emit).toBeCalledWith('playerMoved', player);
      });
      it('should add a town listener, which should emit "playerDisconnect" to the socket when a player disconnects', async () => {
        TestUtils.setSessionTokenAndTownID(
          testingTown.coveyTownID,
          session.sessionToken,
          mockSocket,
        );
        townSubscriptionHandler(mockSocket);
        testingTown.destroySession(session);
        expect(mockSocket.emit).toBeCalledWith('playerDisconnect', player);
      });
      it('should add a town listener, which should emit "townClosing" to the socket and disconnect it when disconnectAllPlayers is called', async () => {
        TestUtils.setSessionTokenAndTownID(
          testingTown.coveyTownID,
          session.sessionToken,
          mockSocket,
        );
        townSubscriptionHandler(mockSocket);
        testingTown.disconnectAllPlayers();
        expect(mockSocket.emit).toBeCalledWith('townClosing');
        expect(mockSocket.disconnect).toBeCalledWith(true);
      });
      describe('when a socket disconnect event is fired', () => {
        it('should remove the town listener for that socket, and stop sending events to it', async () => {
          TestUtils.setSessionTokenAndTownID(
            testingTown.coveyTownID,
            session.sessionToken,
            mockSocket,
          );
          townSubscriptionHandler(mockSocket);

          // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
          const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
          if (disconnectHandler && disconnectHandler[1]) {
            disconnectHandler[1]();
            const newPlayer = new Player('should not be notified');
            await testingTown.addPlayer(newPlayer);
            expect(mockSocket.emit).not.toHaveBeenCalledWith('newPlayer', newPlayer);
          } else {
            fail('No disconnect handler registered');
          }
        });
        it('should destroy the session corresponding to that socket', async () => {
          TestUtils.setSessionTokenAndTownID(
            testingTown.coveyTownID,
            session.sessionToken,
            mockSocket,
          );
          townSubscriptionHandler(mockSocket);

          // find the 'disconnect' event handler for the socket, which should have been registered after the socket was connected
          const disconnectHandler = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect');
          if (disconnectHandler && disconnectHandler[1]) {
            disconnectHandler[1]();
            mockReset(mockSocket);
            TestUtils.setSessionTokenAndTownID(
              testingTown.coveyTownID,
              session.sessionToken,
              mockSocket,
            );
            townSubscriptionHandler(mockSocket);
            expect(mockSocket.disconnect).toHaveBeenCalledWith(true);
          } else {
            fail('No disconnect handler registered');
          }
        });
      });
      it('should forward playerMovement events from the socket to subscribed listeners', async () => {
        TestUtils.setSessionTokenAndTownID(
          testingTown.coveyTownID,
          session.sessionToken,
          mockSocket,
        );
        townSubscriptionHandler(mockSocket);
        const mockListener = mock<CoveyTownListener>();
        testingTown.addTownListener(mockListener);
        // find the 'playerMovement' event handler for the socket, which should have been registered after the socket was connected
        const playerMovementHandler = mockSocket.on.mock.calls.find(
          call => call[0] === 'playerMovement',
        );
        if (playerMovementHandler && playerMovementHandler[1]) {
          const newLocation = generateTestLocation();
          player.location = newLocation;
          playerMovementHandler[1](newLocation);
          expect(mockListener.onPlayerMoved).toHaveBeenCalledWith(player);
        } else {
          fail('No playerMovement handler registered');
        }
      });
    });
  });
});
