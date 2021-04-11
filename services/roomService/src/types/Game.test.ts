import { nanoid } from "nanoid";
import pool from "../dbconnector/pool";
import { deleteMazeCompletionTime, getMazeCompletionTime } from "../utils/queries";
import Player from "./Player";
import { MazeCompletionTimeRow } from "../requestHandlers/CoveyTownRequestHandlers"
import { MazeCompletionTimeList } from "../CoveyTypes";
import Maze from "../lib/Maze";

async function deleteFromDatabase(player1Name: string, player2Name: string) {
    await pool.query(deleteMazeCompletionTime, [ player1Name ]);
    await pool.query(deleteMazeCompletionTime, [ player2Name ]);
    const resultsMapped = await getResults();
    expect(resultsMapped.find(result => { result.username === player1Name })).toBeUndefined();
    expect(resultsMapped.find(result => { result.username === player2Name })).toBeUndefined();
}

async function getResults(): Promise<MazeCompletionTimeList> {
  const results = await pool.query(getMazeCompletionTime);
  const resultsMapped: MazeCompletionTimeList = results.rows.map((row: MazeCompletionTimeRow) => ({
    playerID: row.player_id,
    username: row.username,
    time: row.time,
  }));
  return resultsMapped;
}

describe('Maze game tests', () => {
  it('Game should be added and deleted to maze when game is started and finished', async() => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);
    const gameId = player2.acceptInvite(player1);
    expect(Maze.getInstance().hasGame(gameId)).toEqual(true);
    await player1.finish(-1, true);
    expect(Maze.getInstance().hasGame(gameId)).toEqual(true);
    await player2.finish(100, false);
    expect(Maze.getInstance().hasGame(gameId)).toEqual(false);
  });

  it('Players should not be able to finish the same game multiple times', async() => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);
    player2.acceptInvite(player1);
    await player1.finish(100, false);
    await player2.finish(-1, false);

    try {
      await player1.finish(1000, false);
      fail();
    } catch(e) {
      expect(e.message).toEqual('game undefined');
    }
    try {
      await player2.finish(10000, false);
      fail();
    } catch(e) {
      expect(e.message).toEqual('game undefined');
    }
  }); 

  it('Race where both give up should not push anything to database', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);
    player2.acceptInvite(player1);
    await player1.finish(-1, true);
    await player2.finish(-1, true);
    const resultsMapped = await getResults();
    const playersResults = resultsMapped.filter(tableEntry => tableEntry.playerID === player1.id || tableEntry.playerID === player2.id);
    expect(playersResults).toHaveLength(0);
  });

  it('Race where one gives up (before) should only push winner entry to database', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player2Time = 3;
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);
    player2.acceptInvite(player1);
    await player1.finish(-1, true);
    await player2.finish(player2Time, false);
    const resultsMapped = await getResults();
    const player1Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player1.id);
    const player2Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player2.id && tableEntry.time === player2Time);
    expect(player1Results).toHaveLength(0);
    expect(player2Results).toHaveLength(1);
    deleteFromDatabase(player1Name, player2Name);
  });

  it('Database should update when either player finishes', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new Player(player1Name);
    const player1Time = 10;
    const player2 = new Player(player2Name);
    const player2Time = 50;
    player2.acceptInvite(player1);
    await player1.finish(player1Time, false);
    let resultsMapped = await getResults();
    let player1Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player1.id && tableEntry.time === player1Time);
    let player2Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player2.id);
    expect(player1Results).toHaveLength(1);
    expect(player2Results).toHaveLength(0);

    await player2.finish(player2Time, false);
    resultsMapped = await getResults();
    player1Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player1.id && tableEntry.time === player1Time);
    player2Results = resultsMapped.filter(tableEntry => tableEntry.playerID === player2.id && tableEntry.time === player2Time);
    expect(player1Results).toHaveLength(1);
    expect(player2Results).toHaveLength(1);

    deleteFromDatabase(player1Name, player2Name);
  });
});
