export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  private _enableInvite?: boolean;

  constructor(id: string, userName: string, location: UserLocation, enableInvite?: boolean) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    if (enableInvite !== null) {
      this._enableInvite = enableInvite;
    }
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get enableInvite(): boolean | undefined {
    return this._enableInvite;
  }

  set enableInvite(enabled: boolean | undefined) {
    this._enableInvite = enabled;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    return new Player(playerFromServer._id, playerFromServer._userName, playerFromServer.location, playerFromServer._enableInvite);
  }
}
export type ServerPlayer = { _id: string; _userName: string; _enableInvite: boolean; location: UserLocation };

export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
