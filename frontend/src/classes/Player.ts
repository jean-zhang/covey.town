export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  private _enableInvite: boolean;

  private _hasCompletedMaze: boolean;

  constructor(
    id: string,
    userName: string,
    location: UserLocation,
    enableInvite: boolean,
    hasCompletedMaze: boolean,
  ) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    this._enableInvite = enableInvite;
    this._hasCompletedMaze = hasCompletedMaze;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get enableInvite(): boolean {
    return this._enableInvite;
  }

  set enableInvite(enabled: boolean) {
    this._enableInvite = enabled;
  }

  get hasCompletedMaze(): boolean {
    return this._hasCompletedMaze;
  }

  set hasCompletedMaze(hasCompletedMaze: boolean) {
    this._hasCompletedMaze = hasCompletedMaze;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(
      playerFromServer._id,
      playerFromServer._userName,
      playerFromServer.location,
      playerFromServer._enableInvite,
      playerFromServer._hasCompletedMaze,
    );
  }
}
export type ServerPlayer = {
  _id: string;
  _userName: string;
  _enableInvite: boolean;
  _hasCompletedMaze: boolean;
  location: UserLocation;
};

export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
