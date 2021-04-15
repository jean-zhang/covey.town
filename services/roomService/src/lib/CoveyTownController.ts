import { customAlphabet, nanoid } from 'nanoid';
import { UserLocation } from '../CoveyTypes';
import CoveyTownListener from '../types/CoveyTownListener';
import Player from '../types/Player';
import PlayerSession from '../types/PlayerSession';
import IVideoClient from './IVideoClient';
import Maze from './Maze';
import TwilioVideo from './TwilioVideo';

const friendlyNanoID = customAlphabet('1234567890ABCDEF', 8);
const AUTO_REJECT_GAME_SECONDS = 20;

/**
 * The CoveyTownController implements the logic for each town: managing the various events that
 * can occur (e.g. joining a town, moving, leaving a town)
 */
export default class CoveyTownController {
  get capacity(): number {
    return this._capacity;
  }

  set isPubliclyListed(value: boolean) {
    this._isPubliclyListed = value;
  }

  get isPubliclyListed(): boolean {
    return this._isPubliclyListed;
  }

  get townUpdatePassword(): string {
    return this._townUpdatePassword;
  }

  get players(): Player[] {
    return this._players;
  }

  get occupancy(): number {
    return this._listeners.length;
  }

  get friendlyName(): string {
    return this._friendlyName;
  }

  set friendlyName(value: string) {
    this._friendlyName = value;
  }

  get coveyTownID(): string {
    return this._coveyTownID;
  }

  get maze(): Maze {
    return this._maze;
  }

  /** The maze in the town */
  private _maze: Maze;

  /** The list of players currently in the town * */
  private _players: Player[] = [];

  /** The list of valid sessions for this town * */
  private _sessions: PlayerSession[] = [];

  /** The videoClient that this CoveyTown will use to provision video resources * */
  private _videoClient: IVideoClient = TwilioVideo.getInstance();

  /** The list of CoveyTownListeners that are subscribed to events in this town * */
  private _listeners: CoveyTownListener[] = [];

  private readonly _coveyTownID: string;

  private _friendlyName: string;

  private readonly _townUpdatePassword: string;

  private _isPubliclyListed: boolean;

  private _capacity: number;

  private _autoRejectSetTimeoutKey?: NodeJS.Timeout;

  constructor(friendlyName: string, isPubliclyListed: boolean) {
    this._coveyTownID = process.env.DEMO_TOWN_ID === friendlyName ? friendlyName : friendlyNanoID();
    this._capacity = 50;
    this._townUpdatePassword = nanoid(24);
    this._isPubliclyListed = isPubliclyListed;
    this._friendlyName = friendlyName;
    this._maze = new Maze();
  }

  /**
   * Adds a player to this Covey Town, provisioning the necessary credentials for the
   * player, and returning them
   *
   * @param newPlayer The new player to add to the town
   */
  async addPlayer(newPlayer: Player): Promise<PlayerSession> {
    const theSession = new PlayerSession(newPlayer);

    this._sessions.push(theSession);
    this._players.push(newPlayer);

    // Create a video token for this user to join this town
    theSession.videoToken = await this._videoClient.getTokenForTown(
      this._coveyTownID,
      newPlayer.id,
    );

    // Notify other players that this player has joined
    this._listeners.forEach(listener => listener.onPlayerJoined(newPlayer));

    return theSession;
  }

  /**
   * Destroys all data related to a player in this town.
   *
   * @param session PlayerSession to destroy
   */
  destroySession(session: PlayerSession): void {
    this.playerFinish(session.player.id, -1, true);
    this._players = this._players.filter(p => p.id !== session.player.id);
    this._sessions = this._sessions.filter(s => s.sessionToken !== session.sessionToken);
    this._listeners.forEach(listener => listener.onPlayerDisconnected(session.player));
  }

  /**
   * Updates the location of a player within the town
   * @param player Player to update location for
   * @param location New location for this player
   */
  updatePlayerLocation(player: Player, location: UserLocation): void {
    player.updateLocation(location);
    this._listeners.forEach(listener => listener.onPlayerMoved(player));
  }

  /**
   * Subscribe to events from this town. Callers should make sure to
   * unsubscribe when they no longer want those events by calling removeTownListener
   *
   * @param listener New listener
   */
  addTownListener(listener: CoveyTownListener): void {
    this._listeners.push(listener);
  }

  /**
   * Unsubscribe from events in this town.
   *
   * @param listener The listener to unsubscribe, must be a listener that was registered
   * with addTownListener, or otherwise will be a no-op
   */
  removeTownListener(listener: CoveyTownListener): void {
    this._listeners = this._listeners.filter(v => v !== listener);
  }

  /**
   * Fetch a player's session based on the provided session token. Returns undefined if the
   * session token is not valid.
   *
   * @param token
   */
  getSessionByToken(token: string): PlayerSession | undefined {
    return this._sessions.find(p => p.sessionToken === token);
  }

  disconnectAllPlayers(): void {
    this._listeners.forEach(listener => listener.onTownDestroyed());
  }

  hasPlayer(playerID: string): boolean {
    return this._players.some((player: Player) => player.id === playerID);
  }

  /**
   * returns true if succeeded
   */
  respondToGameInvite(
    senderPlayerID: string,
    recipientPlayerID: string,
    gameAcceptance: boolean,
  ): boolean {
    const sender = this._players.find(player => player.id === senderPlayerID);
    const recipient = this._players.find(player => player.id === recipientPlayerID);

    if (!sender || !recipient) {
      return false;
    }
    this._listeners
      .filter(
        listener =>
          listener.listeningPlayerID === senderPlayerID ||
          listener.listeningPlayerID === recipientPlayerID,
      )
      .forEach(listener => listener.onMazeGameResponded(sender, recipient, gameAcceptance));

    if (this._autoRejectSetTimeoutKey) {
      clearTimeout(this._autoRejectSetTimeoutKey);
    }

    if (gameAcceptance) {
      const gameID = recipient.acceptInvite(sender);
      this._maze.addGame(gameID);
    }
    return true;
  }

  updatePlayerRaceSettings(playerId: string, enabled: boolean): void {
    const updatePlayer = this._players.find(player => player.id === playerId);
    if (updatePlayer) {
      updatePlayer.enableInvite = enabled;
      this._listeners.forEach(listener =>
        listener.onUpdatePlayerRaceSettings(updatePlayer, enabled),
      );
    }
  }

  /**
   * returns true if succeeded
   */
  async playerFinish(playerID: string, score: number, gaveUp: boolean): Promise<boolean> {
    const finishedPlayer = this._players.find(player => player.id === playerID);
    if (!finishedPlayer) {
      return false;
    }
    if (!gaveUp) {
      finishedPlayer.hasCompletedMaze = true;
    }

    const playStatus = await finishedPlayer.finish(score, gaveUp);
    if (!playStatus) {
      return false;
    }

    const { opposingPlayerID, bothPlayersFinished, gameID } = playStatus;
    const opposingPlayer = this._players.find(player => player.id === opposingPlayerID);

    if (bothPlayersFinished) {
      this._maze.removeGame(gameID);
    }

    this._listeners.forEach(listener =>
      listener.onFinishGame(finishedPlayer, opposingPlayer || null, score, gaveUp),
    );
    return true;
  }

  /**
   * returns true if succeeded
   */
  onGameRequested(senderPlayerID: string, recipientPlayerID: string): boolean {
    const sender = this._players.find(player => player.id === senderPlayerID);
    const recipient = this._players.find(player => player.id === recipientPlayerID);

    if (!sender || !recipient) {
      return false;
    }

    let listeners = this._listeners.filter(
      listener =>
        listener.listeningPlayerID === recipientPlayerID ||
        listener.listeningPlayerID === senderPlayerID,
    );

    this._autoRejectSetTimeoutKey = setTimeout(() => {
      listeners.map(listener => listener.onMazeGameResponded(sender, recipient, false));
    }, AUTO_REJECT_GAME_SECONDS * 1000);

    if (!this._maze.reachedCapacity()) {
      listeners.forEach(listener => listener.onMazeGameRequested(sender, recipient));
    } else {
      listeners = listeners.filter(listener => listener.listeningPlayerID === senderPlayerID);
      listeners.forEach(listener => listener.onFullMazeGameRequested(sender));
    }
    return true;
  }
}
