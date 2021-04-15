import { nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
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

  /** Whether the player has ever completed the maze */
  private _hasCompletedMaze: boolean;

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
    this._hasCompletedMaze = false;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get enableInvite(): boolean {
    return this._enableInvite;
  }

  set enableInvite(enabled: boolean) {
    this._enableInvite = enabled;
  }

  get hasCompletedMaze(): boolean {
    return this._hasCompletedMaze;
  }

  set hasCompletedMaze(hasCompletedMaze: boolean) {
    this._hasCompletedMaze = hasCompletedMaze;
  }

  get game(): Game | undefined {
    return this._game;
  }

  updateLocation(location: UserLocation): void {
    this.location = location;
  }

  /**
   * Called when player has completed the maze
   * Returns the player id of the opposing player if the game exists
   */
  async finish(
    timeScore: number,
    gaveUp: boolean,
  ): Promise<
    { opposingPlayerID: string; bothPlayersFinished: boolean; gameID: string } | undefined
    > {
    const game = this._game;
    this.resetPlayer(); // make sure that game is removed so that race conditions can't occur trying to remove multiple times
    if (game !== undefined) {
      await game.playerFinish({ userID: this.id, userName: this.userName }, timeScore, gaveUp);
      const opposingPlayerID = game.getOpposingPlayerID(this._id);
      const bothPlayersFinished = game.bothPlayersFinished();
      const gameID = game.getGameId();
      return { opposingPlayerID, bothPlayersFinished, gameID };
    }
    return undefined;
  }

  /**
   * Accepts an invite to a Game
   * @returns the game id
   */
  acceptInvite(sender: Player): string {
    if (!this._game) {
      const newGame = new Game(this.id, sender.id);
      this._game = newGame;
      sender.onInviteAccepted(newGame);
      return newGame.getGameId();
    }
    return this._game.getGameId();
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
