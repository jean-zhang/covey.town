import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import React, {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import { BrowserRouter } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import TownsServiceClient, { TownJoinResponse } from './classes/TownsServiceClient';
import Video from './classes/Video/Video';
import Login from './components/Login/Login';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import UnsupportedBrowserWarning from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import Instructions from './components/world/Instructions';
import {
  displayMazeGameInviteToast,
  displayMazeGameResponseToast,
} from './components/world/MazeGameToastUtils';
import QuitGame from './components/world/QuitGame';
import WorldMap from './components/world/WorldMap';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import VideoContext from './contexts/VideoContext';
import { CoveyAppState, GameInfo, GameStatus, NearbyPlayers } from './CoveyTypes';

const INSTRUCTIONS_LOCATION = { x: 1455, y: 40 };
type CoveyAppUpdate =
  | {
      action: 'doConnect';
      data: {
        userName: string;
        townFriendlyName: string;
        townID: string;
        townIsPubliclyListed: boolean;
        sessionToken: string;
        myPlayerID: string;
        socket: Socket;
        players: Player[];
        emitMovement: (location: UserLocation) => void;
        emitGameInvite: (senderPlayer: Player, recipientPlayer: Player) => void;
        emitInviteResponse: (
          senderPlayer: Player,
          recipientPlayer: Player,
          gameAcceptance: boolean,
        ) => void;
        emitRaceSettings: (myPlayerID: string, enableInvite: boolean) => void;
        gameInfo: GameInfo;
        toggleQuit: boolean;
        quitGame: () => void;
        enableInvite: boolean,
      };
    }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'toggleQuit' }
  | { action: 'exitMaze' }
  | { action: 'closeInstructions' }
  | { action: 'raceSettings' }
  | { action: 'playerRaceSettings'; player: Player}
  | {
      action: 'updateGameInfo';
      data: {
        gameStatus: GameStatus;
        senderPlayer?: Player;
        recipientPlayer?: Player;
      };
    };

function defaultAppState(): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownFriendlyName: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    sessionToken: '',
    userName: '',
    socket: null,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {},
    emitGameInvite: () => {},
    emitInviteResponse: () => {},
    emitRaceSettings: () => {},
    gameInfo: { gameStatus: 'noGame' },
    apiClient: new TownsServiceClient(),
    toggleQuit: false,
    quitGame: () => {},
    showInstructions: false,
    gameStarted: false,
    enableInvite: true,
  };
}
let closedInstructions = false;
function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
  const nextState = {
    sessionToken: state.sessionToken,
    currentTownFriendlyName: state.currentTownFriendlyName,
    currentTownID: state.currentTownID,
    currentTownIsPubliclyListed: state.currentTownIsPubliclyListed,
    myPlayerID: state.myPlayerID,
    players: state.players,
    currentLocation: state.currentLocation,
    nearbyPlayers: state.nearbyPlayers,
    userName: state.userName,
    socket: state.socket,
    emitMovement: state.emitMovement,
    emitGameInvite: state.emitGameInvite,
    emitInviteResponse: state.emitInviteResponse,
    emitRaceSettings: state.emitRaceSettings,
    gameInfo: state.gameInfo,
    apiClient: state.apiClient,
    toggleQuit: state.toggleQuit,
    quitGame: state.quitGame,
    showInstructions: state.showInstructions,
    gameStarted: state.gameStarted,
    enableInvite: state.enableInvite,
  };

  function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
    const isWithinCallRadius = (p: Player, location: UserLocation) => {
      if (p.location && location) {
        const dx = p.location.x - location.x;
        const dy = p.location.y - location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return { nearbyPlayers: players.filter(p => isWithinCallRadius(p, currentLocation)) };
  }

  function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
    if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length) return false;
    const ids1 = a1.nearbyPlayers.map(p => p.id).sort();
    const ids2 = a2.nearbyPlayers.map(p => p.id).sort();
    return !ids1.some((val, idx) => val !== ids2[idx]);
  }

  let updatePlayer;
  switch (update.action) {
    case 'doConnect':
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      nextState.userName = update.data.userName;
      nextState.emitMovement = update.data.emitMovement;
      nextState.emitGameInvite = update.data.emitGameInvite;
      nextState.emitInviteResponse = update.data.emitInviteResponse;
      nextState.emitRaceSettings = update.data.emitRaceSettings;
      nextState.gameInfo = update.data.gameInfo;
      nextState.socket = update.data.socket;
      nextState.players = update.data.players;
      nextState.toggleQuit = update.data.toggleQuit;
      nextState.quitGame = update.data.quitGame;
      break;
    case 'addPlayer':
      nextState.players = nextState.players.concat([update.player]);
      break;
    case 'playerMoved':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.location = update.player.location;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'playerRaceSettings': 
      updatePlayer = nextState.players.find(p => p.id === update.player.id)
      if (updatePlayer) {
        updatePlayer.enableInvite = update.player.enableInvite;
      }
      break;
    case 'weMoved':
      nextState.currentLocation = update.location;
      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      if (!closedInstructions) {
        nextState.showInstructions =
          update.location.x === INSTRUCTIONS_LOCATION.x &&
          update.location.y === INSTRUCTIONS_LOCATION.y;
      }
      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter(player => player.id !== update.player.id);

      nextState.nearbyPlayers = calculateNearbyPlayers(
        nextState.players,
        nextState.currentLocation,
      );
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'closeInstructions':
      nextState.showInstructions = false;
      closedInstructions = true;
      nextState.gameStarted = true;
      break;
    case 'disconnect':
      state.socket?.disconnect();
      return defaultAppState();
    case 'toggleQuit':
      nextState.toggleQuit = !state.toggleQuit;
      break;
    case 'raceSettings': 
      nextState.enableInvite = !state.enableInvite;
      break;
    case 'exitMaze':
      nextState.toggleQuit = false;
      // TODO: have this call Player.giveUp() in the backend
      // state.socket?.emit('giveUp');
      break;
    case 'updateGameInfo':
      nextState.gameInfo = {
        gameStatus: update.data.gameStatus,
        senderPlayer: update.data.senderPlayer,
        recipientPlayer: update.data.recipientPlayer,
      };
      break;
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}

async function GameController(
  initData: TownJoinResponse,
  dispatchAppUpdate: (update: CoveyAppUpdate) => void,
) {
  // Now, set up the game sockets
  const gamePlayerID = initData.coveyUserID;
  const sessionToken = initData.coveySessionToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const video = Video.instance();
  assert(video);
  const roomName = video.townFriendlyName;
  assert(roomName);

  const socket = io(url, { auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
  socket.on('newPlayer', (player: ServerPlayer) => {
    dispatchAppUpdate({
      action: 'addPlayer',
      player: Player.fromServerPlayer(player),
    });
  });
  socket.on('playerMoved', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerRaceSettings', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerRaceSettings', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerDisconnect', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
  });
  socket.on('disconnect', () => {
    dispatchAppUpdate({ action: 'disconnect' });
  });
  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };
  const emitGameInvite = (senderPlayer: Player, recipientPlayer: Player) => {
    socket.emit('sendGameInvite', senderPlayer.id, recipientPlayer.id);
    dispatchAppUpdate({
      action: 'updateGameInfo',
      data: {
        gameStatus: 'invitePending',
        senderPlayer,
        recipientPlayer,
      },
    });
  };
  const emitInviteResponse = (
    senderPlayer: Player,
    recipientPlayer: Player,
    gameAcceptance: boolean,
  ) => {
    socket.emit('sendGameInviteResponse', senderPlayer.id, recipientPlayer.id, gameAcceptance);
  };
  const emitRaceSettings = (
    myPlayerID: string,
    enableInvite: boolean,
  ) => {
    dispatchAppUpdate({ action: 'raceSettings' });
    socket.emit('raceSettings', myPlayerID, !enableInvite);
  };
  const quitGame = () => {
    dispatchAppUpdate({ action: 'toggleQuit' });
  };
  socket.on('receivedGameInvite', (senderPlayer: ServerPlayer, recipientPlayer: ServerPlayer) => {
    const sender = Player.fromServerPlayer(senderPlayer);
    const recipient = Player.fromServerPlayer(recipientPlayer);
    const onGameResponse = (gameAcceptance: boolean) =>
      emitInviteResponse(sender, recipient, gameAcceptance);
    displayMazeGameInviteToast(sender, onGameResponse);
    dispatchAppUpdate({
      action: 'updateGameInfo',
      data: {
        gameStatus: 'invitePending',
        senderPlayer: sender,
        recipientPlayer: recipient,
      },
    });
  });
  socket.on(
    'mazeGameResponse',
    (senderPlayer: ServerPlayer, recipientPlayer: ServerPlayer, gameAcceptance: boolean) => {
      const sender = Player.fromServerPlayer(senderPlayer);
      const recipient = Player.fromServerPlayer(recipientPlayer);
      displayMazeGameResponseToast(recipient, gameAcceptance);
      dispatchAppUpdate({
        action: 'updateGameInfo',
        data: {
          gameStatus: gameAcceptance ? 'playingGame' : 'noGame',
          senderPlayer: sender,
          recipientPlayer: recipient,
        },
      });
    },
  );

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
      userName: video.userName,
      townFriendlyName: roomName,
      townID: video.coveyTownID,
      myPlayerID: gamePlayerID,
      townIsPubliclyListed: video.isPubliclyListed,
      emitMovement,
      emitGameInvite,
      emitInviteResponse,
      emitRaceSettings,
      gameInfo: { gameStatus: 'noGame' },
      socket,
      players: initData.currentPlayers.map(sp => Player.fromServerPlayer(sp)),
      toggleQuit: false,
      quitGame,
      enableInvite: true, 
    },
  });
  return true;
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());

  const setupGameController = useCallback(
    async (initData: TownJoinResponse) => {
      await GameController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );
  const videoInstance = Video.instance();

  const { setOnDisconnect } = props;
  useEffect(() => {
    setOnDisconnect(() => async () => {
      // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    if (!appState.sessionToken) {
      return <Login doLogin={setupGameController} />;
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <WorldMap />
        <VideoOverlay preferredMode='fullwidth' />
        <QuitGame
          isOpen={appState.toggleQuit}
          onClose={() => dispatchAppUpdate({ action: 'toggleQuit' })}
          onQuit={() => dispatchAppUpdate({ action: 'exitMaze' })}
        />
        <Instructions
          isOpen={appState.showInstructions}
          onClose={() => dispatchAppUpdate({ action: 'closeInstructions' })}
        />
      </div>
    );
  }, [
    setupGameController,
    appState.sessionToken,
    videoInstance,
    appState.showInstructions,
    appState.toggleQuit,
  ]);
  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>
          {page}
        </NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>
  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode='fullwidth' highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
