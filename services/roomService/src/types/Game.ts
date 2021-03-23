import { PlayerInfo } from '../CoveyTypes';

/**
 * Two GamePlayers competing in the Maze is represented by a Game object
 */
export default class Game {

  private _player1ID: string;

  private _player2ID: string;

  /** The winner and loser in this Game * */
  private _pair: Map<PlayerInfo, number>;

  constructor(player1ID: string, player2ID: string) {
    this._player1ID = player1ID;
    this._player2ID = player2ID;
    this._pair = new Map();
  }

  /**
   * Registers the Winner's and Loser's scores 
   */ 
  // registerScore(): void {}
}
