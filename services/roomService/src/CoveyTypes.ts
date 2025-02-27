export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};

export type PlayerInfo = {
  userName: string;
  userID: string;
};

export type CoveyTownList = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
}[];

export type MazeCompletionTimeList = { playerID: string; username: string; time: number }[];
