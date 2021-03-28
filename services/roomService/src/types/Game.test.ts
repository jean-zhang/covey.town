import { nanoid } from "nanoid";
import pool from "../dbconnector/pool";
import { deleteMazeCompletionTime, getMazeCompletionTime, selectPlayerCompletionTime } from "../utils/queries";
import GamePlayer from "./GamePlayer";
import { MazeCompletionTimeRow } from "../requestHandlers/CoveyTownRequestHandlers"

describe('Maze game tests', () => {
  it('Race where both give up should not push anything to database', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new GamePlayer(player1Name);
    const player2 = new GamePlayer(player2Name);
    player2.acceptInvite(player1);
    player1.startGame();
    player2.startGame();
    player1.giveUp();
    player2.giveUp();
    const results = await pool.query(getMazeCompletionTime);
    results.rows.map((row: MazeCompletionTimeRow) => ({
          playerID: row.player_id,
          username: row.username,
          time: row.time,
        }));
    
    await expect(pool.query(selectPlayerCompletionTime, [player2Name])).rejects.toBeDefined();
  });

  it('Race where one gives up (before) should only push winner entry to database', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const timeUntilCompletion = 0;
    const player1 = new GamePlayer(player1Name);
    const player2 = new GamePlayer(player2Name);
    player2.acceptInvite(player1);
    player1.startGame();
    player2.startGame();
    await player1.giveUp();
    await new Promise<void>(res => setTimeout(async () => {
      try {
        await player1.finish();
        await expect(pool.query(selectPlayerCompletionTime, [player1Name])).resolves.toBeCloseTo(timeUntilCompletion);
        await expect(pool.query(selectPlayerCompletionTime, [player2Name])).rejects.toBeDefined();
        res();
      } catch (e) {
        fail(e.message);
      }
    }, timeUntilCompletion));
    await pool.query(deleteMazeCompletionTime, [player1Name]);
  });

  // it('Race where one gives up (after) should only push winner entry to database', async () => {
  //   const player1Name = nanoid();
  //   const player2Name = nanoid();
  //   const timeUntilCompletion = 2000;
  //   const player1 = new GamePlayer(player1Name);
  //   const player2 = new GamePlayer(player2Name);
  //   player2.acceptInvite(player1);
  //   player1.startGame();
  //   player2.startGame();
  //   setTimeout(async () => {
  //     await player1.finish();
  //     setTimeout(async () => {
  //       await player2.giveUp();
  //       await expect(pool.query(selectPlayerCompletionTime, [player1Name])).toBeCloseTo(timeUntilCompletion);
  //       await expect(pool.query(selectPlayerCompletionTime, [player2Name])).toBeUndefined();
  //     }, 3000);
  //   }, timeUntilCompletion);
  //   await pool.query(deleteMazeCompletionTime, [player1Name]);
  // });

  // it('Race where both finish should push both entries to database', async () => {
  //   const player1Name = nanoid();
  //   const player2Name = nanoid();
  //   const timeUntilCompletion1 = 2000;
  //   const timeUntilCompletion2 = 5000;
  //   const player1 = new GamePlayer(player1Name);
  //   const player2 = new GamePlayer(player2Name);
  //   player2.acceptInvite(player1);
  //   player1.startGame();
  //   player2.startGame();
  //   setTimeout(async () => {
  //     player1.finish();
  //     setTimeout(async () => {
  //       player2.finish();
  //       await expect(pool.query(selectPlayerCompletionTime, [player1Name])).toBeCloseTo(timeUntilCompletion1);
  //       await expect(pool.query(selectPlayerCompletionTime, [player2Name])).toBeCloseTo(timeUntilCompletion2);
  //     }, timeUntilCompletion2);
  //   }, timeUntilCompletion1);
  //   await pool.query(deleteMazeCompletionTime, [player1Name]);
  //   await pool.query(deleteMazeCompletionTime, [player2Name]);
  // });
});