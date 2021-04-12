import Player from './Player';

/**
 * A listener for player-related events in each town
 */
export default interface CoveyTownListener {
  /**
   * Player ID of associated with the listener
   */
  listeningPlayerID?: string;

  /**
   * Called when a player joins a town
   * @param newPlayer the new player
   */
  onPlayerJoined(newPlayer: Player): void;

  /**
   * Called when a player's location changes
   * @param movedPlayer the player that moved
   */
  onPlayerMoved(movedPlayer: Player): void;

  /**
   * Called when a player disconnects from the town
   * @param removedPlayer the player that disconnected
   */
  onPlayerDisconnected(removedPlayer: Player): void;

  /**
   * Called when a town is destroyed, causing all players to disconnect
   */
  onTownDestroyed(): void;

  /**
   * Called when a player has a been request to play a game
   * @param recipientPlayer the player that has been invited
   * @param invitedPlayer the player that has done the inviting
   */
  onMazeGameRequested(senderPlayer: Player, recipientPlayer: Player): void;

  /**
   * Called when a player has a been request to play a game
   * @param recipientPlayer the player that has been invited
   * @param senderPlayer the player that has done the inviting
   */
  onMazeGameResponded(senderPlayer: Player, recipientPlayer: Player, gameAcceptance: boolean): void;

  /**
   * Called when a player updates their racing settings
   * @param recipientPlayer the player that has been invited
   * @param senderPlayer the player that has done the inviting
   */
  onPlayerRaceSettings(senderPlayer: Player, raceSettings: boolean): void; 
}
