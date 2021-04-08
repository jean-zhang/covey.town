import { nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
import Maze from '../lib/Maze';
import Game from './Game';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class Player {
  /** The current location of this user in the world map * */
  public location: UserLocation;

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _userName: string;

  /** Whether the Player is in the Maze * */
  private _inMaze: boolean;

  /** Whether the Player can be invited to a Game * */
  private _enableInvite: boolean;

  /** Whether the Player has an invite pending * */
  private _invitePending: boolean;

  /** The Game that this Player is part of */
  private _game?: Game;

  constructor(userName: string) {
    this.location = {
      x: 0,
      y: 0,
      moving: false,
      rotation: 'front',
    };
    this._userName = userName;
    this._id = nanoid();
    this._enableInvite = true;
    this._inMaze = false;
    this._invitePending = false;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  updateLocation(location: UserLocation): void {
    this.location = location;
  }

  /**
   * Sends an invite to a player within the town
   * @param player Player to invite
   */
  // sendInvite(recipient: Player): void {}

  /**
   * Removes player from Game
   */
  async giveUp(): Promise<void> {
    if (this._game) {
      await this._game.updateScore({ userID: this.id, userName: this.userName }, -1);
      this.resetPlayer();
    } else {
      throw new Error('game not defined');
    }
  }

  /**
   * Called when player has completed the maze
   */
  async finish(timeScore: number): Promise<void> {
    if (timeScore > 0 && this._game) {
      await this._game.updateScore({ userID: this.id, userName: this.userName }, timeScore);
      this.resetPlayer();
    }
    throw new Error('start time and game not defined');
  }

  /**
   * Accepts an invite to a Game
   */
  acceptInvite(sender: Player): void {
    const newGame = new Game(this.id, sender.id);
    this._game = newGame;
    sender.onInviteAccepted(newGame);
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
    this._inMaze = false;
    this._game = undefined;
  }
}
