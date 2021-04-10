export default class Player {
  public location?: UserLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public sprite?: Phaser.GameObjects.Sprite;

  public label?: Phaser.GameObjects.Text;

  private _racingEnabled?: boolean;

  constructor(id: string, userName: string, location: UserLocation, racingEnabled?: boolean) {
    this._id = id;
    this._userName = userName;
    this.location = location;
    if(racingEnabled !== null) {
      this._racingEnabled = racingEnabled;
    }
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  get racingEnabled(): boolean | undefined {
    return this._racingEnabled;
  }

  static fromServerPlayer(playerFromServer: ServerPlayer): Player {
    if (playerFromServer.racingEnabled !== undefined) {
      return new Player(playerFromServer._id, playerFromServer._userName, playerFromServer.location, playerFromServer.racingEnabled);
    }
    return new Player(playerFromServer._id, playerFromServer._userName, playerFromServer.location);
  }
}
export type ServerPlayer = { _id: string; _userName: string; location: UserLocation, racingEnabled?: boolean };

export type Direction = 'front' | 'back' | 'left' | 'right';

export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
