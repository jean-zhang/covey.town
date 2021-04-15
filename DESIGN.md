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
<!---ParticipantInfo-->
![image](https://user-images.githubusercontent.com/42978150/114906884-84262d00-9de8-11eb-8be9-54f3c319949b.png)
<!---appStateReducer-->
![image](https://user-images.githubusercontent.com/42978150/114907056-ae77ea80-9de8-11eb-9177-5807af08d21c.png)
<!---App-->
![image](https://user-images.githubusercontent.com/42978150/114907107-b9327f80-9de8-11eb-855f-5079fc441e54.png)
<!---GameController-->
![image](https://user-images.githubusercontent.com/42978150/114907154-c8193200-9de8-11eb-86ab-5454e255cd3c.png)
<!---mazeTimeCreateHandler-->
![image](https://user-images.githubusercontent.com/42978150/114907191-d23b3080-9de8-11eb-97e6-6f0cebc9a5d1.png)
<!---mazeTimeHandler-->
![image](https://user-images.githubusercontent.com/42978150/114907231-dcf5c580-9de8-11eb-8c64-f41095e380b0.png)
<!---CoveyTownListener-->
![image](https://user-images.githubusercontent.com/42978150/114907317-f1d25900-9de8-11eb-9df9-e82894e4c963.png)
<!---CoveyTownController-->
![image](https://user-images.githubusercontent.com/42978150/114907350-fa2a9400-9de8-11eb-9de6-42132b1ea23f.png)
<!---MazeGameToastUtils-->
![image](https://user-images.githubusercontent.com/42978150/114907393-04e52900-9de9-11eb-9b52-2ac2aca7a56d.png)
<!---MenuBar-->
![image](https://user-images.githubusercontent.com/42978150/114907441-10385480-9de9-11eb-8079-e5f5ca66b85a.png)
<!---Player-->
![image](https://user-images.githubusercontent.com/42978150/114907493-1cbcad00-9de9-11eb-90b1-39934a886a0c.png)
<!---Maze-->
![image](https://user-images.githubusercontent.com/42978150/114907528-26deab80-9de9-11eb-9cee-c273eaa230bd.png)
<!---Game-->
![image](https://user-images.githubusercontent.com/42978150/114907903-8fc62380-9de9-11eb-9b76-5621850a8190.png)
<!---townSocketAdapter-->
![image](https://user-images.githubusercontent.com/42978150/114907590-39f17b80-9de9-11eb-897b-a8b46c490e9b.png)
<!---townSubscriptionHandler-->
![image](https://user-images.githubusercontent.com/42978150/114907617-44137a00-9de9-11eb-918e-826697189059.png)
