# Design

## Database Design

## High level architecture

### Frontend Component

We added to the existing frontend component by adding the ability to race within the existing town structure. We added a separate portion to the existing map explicitly for racing on the corn maze using Tiled. Players are transported in and out based on when they request to play the game and when they reach the maze exit. We used React/TypeScript, PhaserJS as well as the existing REST and Socket Clients to communicate with the backend component.

### Backend Component

We added to the existing backend by connecting API requests for the global leaderboard to the database.
We used sockets for the creation of game/starting a game, completing a game, joining a game, and other interactions related to the game.
We created additional classes to represent the game and the two players within it

### Database Component

We used PostgreSQL to persist data about users’ run speeds. Weused ElephantSQL since it is PostgreSQL as a Service and it allows 20MB of data as well as 5 concurrent connections for free.

## CRC Cards

(Only contains our code changes.)
