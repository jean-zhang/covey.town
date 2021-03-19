import Player from './Player';
import Game from './Game';

/**
 * Each Player who is in a Game is represented by a GamePlayer object
 */
export default class GamePlayer extends Player {

  /** The start time of the Player * */
  private _startTime?: Date;

  /** Whether the GamePlayer is in the Maze * */
  private _inMaze: boolean;

  /** Whether the GamePlayer can be invited to a Game * */
  private _enableInvite: boolean;

  /** Whether the GamePlayer has an invite pending * */
  private _invitePending: boolean;

  /** The Game that this Player is part of */
  private _game?: Game;

  constructor(userName: string) {
    super(userName);
    this._enableInvite = true;
    this._inMaze = false;
    this._invitePending = false;
  }

  /**
   * Sends an invite to a player within the town
   * @param player Player to invite
   */  
  // sendInvite(invitee: Player): void {}

  /**
   * Removes player from Game
   */ 
  // giveUp(): void {}

  /**
   * Returns whether this player has completed the maze
   */ 
  // finish(): boolean {}

  /**
   * Accepts an invite to a Game
   */ 
  // acceptInvite(inviter: Player): Game {}
}