import { QueryResult } from 'pg';
import { PlayerInfo } from '../CoveyTypes';
import pool from '../dbconnector/pool';
import { insertMazeCompletionTime } from '../utils/queries';

type finishedPlayer = {
  player: PlayerInfo;
  score: number;
}

/**
 * Two GamePlayers competing in the Maze is represented by a Game object
 */
export default class Game {

  private _player1ID: string;

  private _player2ID: string;

  /** The winner and loser in this Game * */
  private _pair: finishedPlayer[];

  constructor(player1ID: string, player2ID: string) {
    this._player1ID = player1ID;
    this._player2ID = player2ID;
    this._pair = [];
  }

  getGameId(): string {
    return this._player1ID + this._player2ID;
  }
  
  async updateScore(playerId: PlayerInfo, score: number) {
    this._pair.push({ player: playerId, score: score});
    if (this._pair.length >= 2) {
      await this.registerScore();
    }
  }

  /**
   * Registers the Winner's and Loser's scores 
   */ 
  async registerScore() {
    const promises: Promise<QueryResult>[] = [];
    this._pair.forEach(finishedPlayer => {
      if (finishedPlayer.player !== undefined && finishedPlayer.score !== undefined && finishedPlayer.score > 0) {
        promises.push(pool.query(insertMazeCompletionTime, [finishedPlayer.player.userID, finishedPlayer.player.userName, finishedPlayer.score]));
      }
    });
    await Promise.all(promises);
  }
}
