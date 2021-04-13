import { nanoid } from "nanoid";
import pool from "../dbconnector/pool";
import { deleteMazeCompletionTime, getMazeCompletionTime } from "../utils/queries";
import Player from "./Player";
import { MazeCompletionTimeRow } from "../requestHandlers/CoveyTownRequestHandlers"
import { MazeCompletionTimeList } from "../CoveyTypes";
import CoveyTownController from '../lib/CoveyTownController';
import CoveyTownListener from '../types/CoveyTownListener';
import CoveyTownsStore from '../lib/CoveyTownsStore';

import Maze from "../lib/Maze";

const mockCoveyListenerTownDestroyed = jest.fn();
const mockCoveyListenerOtherFns = jest.fn();
function mockCoveyListener(id: string): CoveyTownListener {
  return {
    listeningPlayerID: id,
    onPlayerDisconnected(removedPlayer: Player): void {
      mockCoveyListenerOtherFns(removedPlayer);
    },
    onPlayerMoved(movedPlayer: Player): void {
      mockCoveyListenerOtherFns(movedPlayer);
    },
    onTownDestroyed() {
      mockCoveyListenerTownDestroyed();
    },
    onPlayerJoined(newPlayer: Player) {
      mockCoveyListenerOtherFns(newPlayer);
    },
    onMazeGameRequested(senderPlayer: Player, recipientPlayer: Player) {
      mockCoveyListenerOtherFns(senderPlayer, recipientPlayer);
    },
    onMazeGameResponded(senderPlayer: Player, recipientPlayer: Player, gameAcceptance: boolean) {
      mockCoveyListenerOtherFns(senderPlayer, recipientPlayer, gameAcceptance);
    },
    onFinishGame(finishedPlayer: Player, score: number, gaveUp: boolean) {
      mockCoveyListenerOtherFns(finishedPlayer, score, gaveUp);
    },
    onFullMazeGameRequested(senderPlayer: Player) {
      mockCoveyListenerOtherFns(senderPlayer);
    },
  };
}

async function deleteFromDatabase(player1Name: string, player2Name: string) {
  await pool.query(deleteMazeCompletionTime, [player1Name]);
  await pool.query(deleteMazeCompletionTime, [player2Name]);
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
  // it('Game should be added and deleted to maze when game is started and finished', async () => {

  //   const player1Name = nanoid();
  //   const player2Name = nanoid();

  //   const player1 = new Player(player1Name);
  //   const player2 = new Player(player2Name);
  //   const mockCoveyListener1 = mockCoveyListener(player1.id);
  //   const mockCoveyListener2 = mockCoveyListener(player2.id);
  //   const gameId = player2.acceptInvite(player1);
  //   const townName = `FriendlyNameTest-${nanoid()}`;
  //   const townController = new CoveyTownController(townName, false);
  //   townController.addPlayer(player1);
  //   townController.addPlayer(player2);
  //   townController.addTownListener(mockCoveyListener1);
  //   townController.addTownListener(mockCoveyListener2);
  //   townController.respondToGameInvite(player1.id, player2.id, true);
  //   expect(townController.maze.hasGame(gameId)).toEqual(true);
  //   await townController.playerFinish(player1.id, -1, true);
  //   expect(townController.maze.hasGame(gameId)).toEqual(true);
  //   await townController.playerFinish(player2.id, 100, false);
  //   expect(townController.maze.hasGame(gameId)).toEqual(false);
  // });

  it('Players should not be able to finish the same game multiple times', async () => {
    const player1Name = nanoid();
    const player2Name = nanoid();
    const player1 = new Player(player1Name);
    const player2 = new Player(player2Name);
    const gameId = player2.acceptInvite(player1);
    let playerStatus = await player1.finish(100, false);
    if (playerStatus) {
      expect(playerStatus.opposingPlayerId).toEqual(player2.id);
      expect(playerStatus.bothPlayersFinished).toEqual(false);
      expect(playerStatus.gameId).toEqual(gameId);
    } else {
      fail();
    }
    let player2Status = await player2.finish(-1, false);
    if (player2Status) {
      expect(player2Status.opposingPlayerId).toEqual(player1.id);
      expect(player2Status.bothPlayersFinished).toEqual(true);
      expect(player2Status.gameId).toEqual(gameId);
    } else {
      fail();
    }
    playerStatus = await player1.finish(1000, false);
    player2Status = await player2.finish(1000, false);
    expect(playerStatus).toBeUndefined();
    expect(player2Status).toBeUndefined();
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
