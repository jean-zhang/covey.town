/**
 * Each Player who is in a Game is represented by a Player object
 */
export default class Maze {
  /** The capacity of the Maze * */
  public static readonly CAPACITY: number = 10;

  /** The Games in this Maze * */
  private _gameIds = new Set<string>();

  /** The leaderboard that keeps track of the Player username and Score * */
  private _leaderboard: Map<string, number>;

  constructor() {
    this._leaderboard = new Map();
  }

  /**
   * Checks whether the maze is full
   */
  reachedCapacity(): boolean {
    return this._gameIds.size >= Maze.CAPACITY / 2;
  }

  /**
   * Updates the scores on the leaderboard
   */
  // updateLeaderboard(player1ID: string, player1Score: number, player2ID: string, player2Score: number): void {}

  /**
   * Adds a game to the Maze
   */
  addGame(gameId: string): void {
    if (!this.reachedCapacity()) {
      this._gameIds.add(gameId);
    } else {
      throw new Error('Maze is over capacity');
    }
  }

  /**
   * Removes a game from the Maze
   */
  removeGame(gameId: string): void {
    this._gameIds.delete(gameId);
  }

  /**
   * Returns true if the maze contains the specified game
   */
  hasGame(gameId: string): boolean {
    return this._gameIds.has(gameId);
  }
}
