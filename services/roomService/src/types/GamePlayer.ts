import Player from './Player';
import Game from './Game';
import Maze from '../lib/Maze';

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
  // sendInvite(invitee: GamePlayer): void {}

  /**
   * Start the maze
   */
  startGame() {
    this._startTime = new Date();
  }

  /**
   * Removes player from Game
   */ 
  async giveUp() {
    if (this._game) {
      await this._game.updateScore({ userID: this.id, userName: this.userName}, -1);
      this.resetPlayer();
    } else {
      throw new Error('game not defined');
    }
  }

  /**
   * Called when player has completed the maze
   */ 
  async finish() {
    if (this._startTime && this._game) {
      const score = new Date().getTime() - this._startTime.getTime();
      await this._game.updateScore({ userID: this.id, userName: this.userName}, score);
      this.resetPlayer();
    } else {
      throw new Error('start time and game not defined');
    }
  }

  /**
   * Accepts an invite to a Game
   */ 
  acceptInvite(inviter: GamePlayer): void {
    const newGame = new Game(this.id, inviter.id);
    this._game = newGame;
    inviter.onInviteAccepted(newGame);
    Maze.getInstance().addGame(newGame.getGameId());
  }

  onInviteAccepted(game: Game): void {
    this._invitePending = false;
    this._game = game;
  }

  /**
   * Resets fields of this player
   */ 
  resetPlayer(): void {
    this._startTime = undefined;
    this._inMaze = false;
    this._inMaze = false;
    this._game = undefined;
  }
}