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
import TownsServiceClient, {
  MazeCompletionInfo,
  TownJoinResponse,
} from './classes/TownsServiceClient';
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
import LeaderboardModal from './components/world/LeaderboardModal';
import {
  dismissAllToasts,
  dismissToastById,
  displayInviteExpiredResponse,
  displayInviteSentToast,
  displayMazeFullGameResponseToast,
  displayMazeGameInviteToast,
  displayMazeGameResponseToast,
  displayPlayerFinishedToast,
} from './components/world/MazeGameToastUtils';
import QuitGame from './components/world/QuitGame';
import WorldMap from './components/world/WorldMap';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import VideoContext from './contexts/VideoContext';
import { CoveyAppState, GameInfo, GameStatus, NearbyPlayers } from './CoveyTypes';

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
        emitFinishGame: (score: number, gaveUp: boolean) => void;
        gameInfo: GameInfo;
        toggleQuit: boolean;
        quitGame: () => void;
        toggleShowLeaderboard: () => void;
        finishGame: (score: number, gaveUp: boolean) => void;
        updateGameInfoStatus: (gameStatus: GameStatus) => void;
        emitRaceSettings: (myPlayerID: string, enableInvite: boolean) => void;
        enableInvite: boolean;
      };
    }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'disconnect' }
  | { action: 'toggleQuit' }
  | { action: 'updateGameInfoStatus'; gameStatus: GameStatus }
  | { action: 'exitMaze' }
  | { action: 'closeInstructions' }
  | { action: 'toggleRaceSettings' }
  | { action: 'updatePlayerRaceSettings'; player: Player }
  | { action: 'toggleLeaderboard' }
  | { action: 'updatePlayerHasCompletedMaze'; player: Player }
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
    emitFinishGame: () => {},
    emitRaceSettings: () => {},
    gameInfo: { gameStatus: 'noGame' },
    apiClient: new TownsServiceClient(),
    toggleQuit: false,
    quitGame: () => {},
    finishGame: () => {},
    showInstructions: false,
    showLeaderboard: false,
    toggleShowLeaderboard: () => {},
    updateGameInfoStatus: () => {},
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
    emitFinishGame: state.emitFinishGame,
    emitRaceSettings: state.emitRaceSettings,
    gameInfo: state.gameInfo,
    apiClient: state.apiClient,
    toggleQuit: state.toggleQuit,
    quitGame: state.quitGame,
    finishGame: state.finishGame,
    showInstructions: state.showInstructions,
    showLeaderboard: state.showLeaderboard,
    toggleShowLeaderboard: state.toggleShowLeaderboard,
    updateGameInfoStatus: state.updateGameInfoStatus,
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
      nextState.emitFinishGame = update.data.emitFinishGame;
      nextState.emitRaceSettings = update.data.emitRaceSettings;
      nextState.gameInfo = update.data.gameInfo;
      nextState.socket = update.data.socket;
      nextState.players = update.data.players;
      nextState.toggleQuit = update.data.toggleQuit;
      nextState.quitGame = update.data.quitGame;
      nextState.toggleShowLeaderboard = update.data.toggleShowLeaderboard;
      nextState.finishGame = update.data.finishGame;
      nextState.updateGameInfoStatus = update.data.updateGameInfoStatus;
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
    case 'updatePlayerRaceSettings':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
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
      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter(player => player.id !== update.player.id);
      if (state.gameInfo.senderPlayer && state.gameInfo.senderPlayer.id === update.player.id) {
        dismissToastById(update.player.id);
        if (state.gameInfo.gameStatus === 'noGame') {
          displayInviteExpiredResponse(update.player);
        }
        nextState.gameInfo = {
          gameStatus: 'noGame',
        };
      }
      if (
        state.gameInfo.recipientPlayer &&
        state.gameInfo.recipientPlayer.id === update.player.id
      ) {
        if (state.gameInfo.gameStatus === 'invitePending') {
          displayInviteExpiredResponse(update.player);
        }
        nextState.gameInfo = {
          gameStatus: 'noGame',
        };
      }
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
      nextState.gameInfo.gameStatus = 'gameStarted';
      break;
    case 'toggleLeaderboard':
      nextState.showLeaderboard = !state.showLeaderboard;
      break;
    case 'disconnect':
      dismissAllToasts();
      state.socket?.emit('finishGame', state.myPlayerID, -1, true);
      state.socket?.disconnect();
      closedInstructions = false;
      return defaultAppState();
    case 'toggleQuit':
      if (state.gameInfo.gameStatus === 'gameStarted') {
        nextState.toggleQuit = !state.toggleQuit;
      }
      break;
    case 'toggleRaceSettings':
      nextState.enableInvite = !state.enableInvite;
      break;
    case 'exitMaze':
      nextState.toggleQuit = false;
      nextState.gameInfo.gameStatus = 'gameEnded';
      closedInstructions = false;
      break;
    case 'updateGameInfoStatus':
      nextState.gameInfo.gameStatus = update.gameStatus;
      break;
    case 'updateGameInfo':
      nextState.gameInfo = {
        gameStatus: update.data.gameStatus,
        senderPlayer: update.data.senderPlayer,
        recipientPlayer: update.data.recipientPlayer,
      };
      if (nextState.gameInfo.gameStatus === 'playingGame') {
        if (!closedInstructions) {
          nextState.showInstructions = true;
        }
      }
      break;
    case 'updatePlayerHasCompletedMaze':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.hasCompletedMaze = update.player.hasCompletedMaze;
      }
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
  socket.on('updatePlayerRaceSettings', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({
        action: 'updatePlayerRaceSettings',
        player: Player.fromServerPlayer(player),
      });
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
  const emitFinishGame = (score: number, gaveUp: boolean) => {
    socket.emit('finishGame', gamePlayerID, score, gaveUp);
  };
  const emitRaceSettings = (myPlayerID: string, enableInvite: boolean) => {
    dispatchAppUpdate({ action: 'toggleRaceSettings' });
    socket.emit('toggleRaceSettings', myPlayerID, !enableInvite);
  };
  const quitGame = () => {
    dispatchAppUpdate({ action: 'toggleQuit' });
  };
  const toggleShowLeaderboard = () => {
    dispatchAppUpdate({ action: 'toggleLeaderboard' });
  };
  const finishGame = (score: number, gaveUp: boolean) => {
    dispatchAppUpdate({ action: 'exitMaze' });
    emitFinishGame(score, gaveUp);
  };
  const updateGameInfoStatus = (gameStatus: GameStatus) => {
    dispatchAppUpdate({ action: 'updateGameInfoStatus', gameStatus });
  };
  socket.on('receivedGameInvite', (senderPlayer: ServerPlayer, recipientPlayer: ServerPlayer) => {
    const sender = Player.fromServerPlayer(senderPlayer);
    const recipient = Player.fromServerPlayer(recipientPlayer);
    const onGameResponse = (gameAcceptance: boolean) =>
      emitInviteResponse(sender, recipient, gameAcceptance);
    if (gamePlayerID === sender.id) {
      displayInviteSentToast(recipient);
    } else {
      displayMazeGameInviteToast(sender, onGameResponse);
      dispatchAppUpdate({
        action: 'updateGameInfo',
        data: {
          gameStatus: 'invitePending',
          senderPlayer: sender,
          recipientPlayer: recipient,
        },
      });
    }
  });
  socket.on('mazeFullGameResponse', (senderPlayer: ServerPlayer) => {
    const sender = Player.fromServerPlayer(senderPlayer);
    displayMazeFullGameResponseToast();
    dispatchAppUpdate({
      action: 'updateGameInfo',
      data: {
        gameStatus: 'noGame',
        senderPlayer: sender,
      },
    });
  });
  socket.on(
    'mazeGameResponse',
    (senderPlayer: ServerPlayer, recipientPlayer: ServerPlayer, gameAcceptance: boolean) => {
      const sender = Player.fromServerPlayer(senderPlayer);
      const recipient = Player.fromServerPlayer(recipientPlayer);
      if (sender.id === gamePlayerID) {
        displayMazeGameResponseToast(recipient, gameAcceptance);
      }
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
  socket.on(
    'playerFinished',
    (finishedPlayer: ServerPlayer, partnerPlayer: ServerPlayer | null, score: number, gaveUp: boolean) => {
      const finished = Player.fromServerPlayer(finishedPlayer);
      const partner = partnerPlayer ? Player.fromServerPlayer(partnerPlayer) : null;
      if (gamePlayerID === finished.id || gamePlayerID === partner?.id) {
        displayPlayerFinishedToast(finished, score, gaveUp);
      }
      dispatchAppUpdate({
        action: 'updatePlayerHasCompletedMaze',
        player: finished,
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
      emitFinishGame,
      emitRaceSettings,
      gameInfo: { gameStatus: 'noGame' },
      socket,
      players: initData.currentPlayers.map(sp => Player.fromServerPlayer(sp)),
      toggleQuit: false,
      quitGame,
      toggleShowLeaderboard,
      finishGame,
      updateGameInfoStatus,
      enableInvite: true,
    },
  });
  return true;
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());
  const [currentMazeCompletionList, setCurrentMazeCompletionList] = useState<MazeCompletionInfo[]>(
    [],
  );
  const {
    emitFinishGame,
    sessionToken,
    toggleQuit,
    showInstructions,
    showLeaderboard,
    apiClient,
    nearbyPlayers,
  } = appState;

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

  const updateMazeCompletionTimes = useCallback(() => {
    apiClient.getMazeCompletionTimes().then(times => {
      setCurrentMazeCompletionList(times.mazeCompletionTimes);
    });
  }, [setCurrentMazeCompletionList, apiClient]);

  useEffect(() => {
    updateMazeCompletionTimes();
    const timer = setInterval(updateMazeCompletionTimes, 3000);
    return () => {
      clearInterval(timer);
    };
  }, [updateMazeCompletionTimes]);

  const page = useMemo(() => {
    if (!sessionToken) {
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
          isOpen={toggleQuit}
          onClose={() => dispatchAppUpdate({ action: 'toggleQuit' })}
          onQuit={() => {
            dispatchAppUpdate({ action: 'exitMaze' });
            emitFinishGame(-1, true);
          }}
        />
        <Instructions
          isOpen={showInstructions}
          onClose={() => dispatchAppUpdate({ action: 'closeInstructions' })}
        />
        <LeaderboardModal
          isOpen={showLeaderboard}
          onClose={() => dispatchAppUpdate({ action: 'toggleLeaderboard' })}
          leaderboardData={currentMazeCompletionList}
        />
      </div>
    );
  }, [
    setupGameController,
    sessionToken,
    videoInstance,
    showInstructions,
    showLeaderboard,
    toggleQuit,
    emitFinishGame,
    currentMazeCompletionList,
  ]);
  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={nearbyPlayers}>{page}</NearbyPlayersContext.Provider>
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
