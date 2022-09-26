# AI Arena Ladder

The AI Arena ladder consists of two main parts:  
- Game Server
- Ladder/Websockets Server  

The Game server waits until it receives info about a game to run. For now this is just the code for both teams. 
The Game Server then runs the game as quickly as it can and passes the game state to the Ladder via websockets.
 When the game ends, the Game Server sends a special 'game over' packet to the Ladder. 
 The Ladder interacts with the API to store the information about the game, update user stats etc, 
 and then it passes a new game to the Game Server, which runs again until it is finished. 
 If the game queue of the ladder gets too low, it will grab new games from the API. 
 These are usually games of players who haven't interacted before, or code with the fewest online matches.

 ```mermaid
graph LR  
    GameServer ->|GameState| Ladder;
    Ladder ->|GameParams| GameServer;
    Ladder ->|GameState| Client_1;
    Ladder -> Client_2;
    Ladder -> Client_3;
    API ->|UserCode| Ladder;
 ```

### Running Locally:

Run the Game Server
```
    node .\game_server\game.js
```

Run the Ladder
```
    node .\game_server\game.js
```


Run the game client:
```
    cd http-server
```

go to localhost:8080/index.html

### Running in Docker:

### Deploying:

TODO: put some stuff here

## Networking:

Packet types:

0 - game state
1 - game score data
2 - game over conditions
