import Game from '../types/Game';

/**
 * Each Player who is in a Game is represented by a GamePlayer object
 */
export default class Maze {

  /** The capacity of the Maze * */
  public static readonly CAPACITY : number = 10;

  /** The Games in this Maze * */
  private _games: Game[] = [];

  /** The leaderboard that keeps track of the Player username and Score * */
  private _leaderboard: Map<string, number>;

  private static _instance: Maze;

  static getInstance(): Maze {
    if (Maze._instance === undefined) {
      Maze._instance = new Maze();
    }
    return Maze._instance;
  }

  constructor() {
    this._leaderboard = new Map();
  }

  /**
   * Checks whether the maze is full
   */  
  // reachedCapacity(): boolean {}

  /**
   * Updates the scores on the leaderboard
   */ 
  // updateLeaderboard(): void {}

  /**
   * Adds a game to the Maze
   */
  // addGame(game: Game): void {}
}