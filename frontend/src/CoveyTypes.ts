import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import TownsServiceClient from './classes/TownsServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';
export type GameStatus = 'invitePending' | 'noGame' | 'playingGame';

export type VideoRoom = {
  twilioID: string;
  id: string;
};
export type UserProfile = {
  displayName: string;
  id: string;
};
export type NearbyPlayers = {
  nearbyPlayers: Player[];
};
export type GameInfo = {
  gameStatus: GameStatus;
  senderPlayer?: Player;
  recipientPlayer?: Player;
};

export type CoveyAppState = {
  sessionToken: string;
  userName: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  myPlayerID: string;
  players: Player[];
  currentLocation: UserLocation;
  nearbyPlayers: NearbyPlayers;
  emitMovement: (location: UserLocation) => void;
  emitGameInvite: (senderPlayer: Player, recipientPlayer: Player) => void;
  emitRaceSettings: (myPlayerId: string, enableInvite: boolean) => void;
  gameInfo: GameInfo;
  socket: Socket | null;
  apiClient: TownsServiceClient;
  toggleQuit: boolean;
  quitGame: () => void;
  showInstructions: boolean;
  showLeaderboard: boolean;
  gameStarted: boolean;
  enableInvite: boolean;
};
