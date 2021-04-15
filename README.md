# Covey Corn Maze

[Public Repository Link](https://github.com/jean-zhang/covey.town)

This fork of the original [Covey.Town repo](https://github.com/neu-se/covey.town) adds onto the open-source conferencing app with a corn maze game, extending the original map to include the new maze as well as features to invite others to race in the maze and collect best times into a global leaderboard.

You can view our reference deployment of the app at [https://covey-maze.netlify.app/](https://covey-maze.netlify.app/).

## Running this app locally

Running the application locally entails running both the backend service and a frontend.

### Setting up the backend

To run the backend, you will need a Twilio account. Twilio provides new accounts with $15 of credit, which is more than enough to get started. You will also need an ElephantSQL account. ElephantSQL has a free plan that includes storage of 20MB of data.
To create an account and configure your local environment:

1. Go to [Twilio](https://www.twilio.com/) and create an account. You do not need to provide a credit card to create a trial account.
2. Create an API key and secret (select "API Keys" on the left under "Settings")
3. Go to [ElephantSQL](https://www.elephantsql.com/) and create an account. You do not need to provide a credit card for the free pricing tier.
4. Create a new instance and get the connection URL from the Details screen.
5. Use the SQL browser and run the following query to create the table:
   `CREATE TABLE IF NOT EXISTS maze_completion_time ( id SERIAL PRIMARY KEY, player_id VARCHAR NOT NULL, username VARCHAR NOT NULL, time INT NOT NULL );`
6. Create a `.env` file in the `services/roomService` directory, setting the values as follows:

| Config Value                    | Description                                    |
| ------------------------------- | ---------------------------------------------- |
| `TWILIO_ACCOUNT_SID`            | Visible on your twilio account dashboard.      |
| `TWILIO_API_KEY_SID`            | The SID of the new API key you created.        |
| `TWILIO_API_KEY_SECRET`         | The secret for the API key you created.        |
| `TWILIO_API_AUTH_TOKEN`         | Visible on your twilio account dashboard.      |
| `ELEPHANTSQL_CONNECTION_STRING` | Visible on your ElephantSQL account dashboard. |

### Starting the backend

Once your backend is configured, you can start it by running `npm start` in the `services/roomService` directory (the first time you run it, you will also need to run `npm install`).
The backend will automatically restart if you change any of the files in the `services/roomService/src` directory.

### Configuring the frontend

Create a `.env` file in the `frontend` directory, with the line: `REACT_APP_TOWNS_SERVICE_URL=http://localhost:8081` (if you deploy the rooms/towns service to another location, put that location here instead)

### Running the frontend

In the `frontend` directory, run `npm start` (again, you'll need to run `npm install` the very first time). After several moments (or minutes, depending on the speed of your machine), a browser will open with the frontend running locally.
The frontend will automatically re-compile and reload in your browser if you change any files in the `frontend/src` directory.
