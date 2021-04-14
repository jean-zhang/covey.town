/**
 * Each Player who is in a Game is represented by a Player object
 */
export default class Maze {
  /** The capacity of the Maze * */
  public static readonly CAPACITY: number = 10;

  /** The Games in this Maze * */
  private _gameIDs = new Set<string>();

  /** The leaderboard that keeps track of the Player username and Score * */
  private _leaderboard: Map<string, number>;

  constructor() {
    this._leaderboard = new Map();
  }

  /**
   * Checks whether the maze is full
   */
  reachedCapacity(): boolean {
    return this._gameIDs.size >= Maze.CAPACITY / 2;
  }

  /**
   * Updates the scores on the leaderboard
   */
  // updateLeaderboard(player1ID: string, player1Score: number, player2ID: string, player2Score: number): void {}

  /**
   * Adds a game to the Maze
   */
  addGame(gameID: string): void {
    if (!this.reachedCapacity()) {
      this._gameIDs.add(gameID);
    } else {
      throw new Error('Maze is over capacity');
    }
  }

  /**
   * Removes a game from the Maze
   */
  removeGame(gameID: string): void {
    this._gameIDs.delete(gameID);
  }

  /**
   * Returns true if the maze contains the specified game
   */
  hasGame(gameID: string): boolean {
    return this._gameIDs.has(gameID);
  }
}
