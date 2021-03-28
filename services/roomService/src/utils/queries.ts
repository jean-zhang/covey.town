export const getMazeCompletionTime =
  'SELECT player_id, username, time FROM maze_completion_time ORDER BY time ASC';

export const insertMazeCompletionTime = `
INSERT INTO maze_completion_time (player_id, username, time) 
VALUES ($1, $2, $3)
`;
