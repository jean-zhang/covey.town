import { PlayerInfo } from '../CoveyTypes';
import pool from '../dbconnector/pool';
import { insertMazeCompletionTime } from '../utils/queries';

/**
 * Two Players competing in the Maze is represented by a Game object
 */
export default class Game {
  private _player1ID: string;

  private _player2ID: string;

  /** The winner and loser in this Game * */
  private finishedPlayers: string[] = [];

  constructor(player1ID: string, player2ID: string) {
    this._player1ID = player1ID;
    this._player2ID = player2ID;
  }

  getOpposingPlayerID(playerID: string): string {
    return (playerID === this._player1ID) ? this._player2ID : this._player1ID;
  }

  getGameId(): string {
    return this._player1ID + this._player2ID;
  }

  async playerFinish(playerInfo: PlayerInfo, score: number, gaveUp: boolean): Promise<void> {
    this.finishedPlayers.push(playerInfo.userID);
    if (!gaveUp && score > 0) {
      await pool.query(insertMazeCompletionTime, [
        playerInfo.userID,
        playerInfo.userName,
        score,
      ]);
    }
  }

  bothPlayersFinished(): boolean {
    return this.finishedPlayers.length >= 2;
  }
}
