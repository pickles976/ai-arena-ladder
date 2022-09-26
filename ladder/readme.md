Ladder
 
The ladder keeps a local queue of games to run as JSON objects. The ladder is responsible for going through the queue and passing the games off to the game server, receiving updates from the game server, and routing the game server updates to the subscribed clients via websockets.

Game packets are ~12Kbps and are sent 30x per second, resulting in about 360Kbps or per client. This should be fine as long as there are only a few users watching tournaments at a time.

## TODO:

- [x] Create example JSON for game queue object
- [x] Queue of games (Creating, running, modifying)
- [x] Pass data to gameserver
- [x] Listen for gameserver updates
- [x] Relay updates to clients
- [x] Perform mocked actions on game end (recording game stats, updating elo)
- [x] Dockerize 
- [ ] Add API calls