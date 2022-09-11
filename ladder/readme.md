Ladder
 
The ladder keeps a local queue of games to run as JSON objects. The ladder is responsible for going through the queue and passing the games off to the game server, receiving updates from the game server, and routing the game server updates to the subscribed clients via websockets.

Game packets are ~1.5Kbps and are sent 15x per second, resulting in about 22-30Kbps per client. This should be fine as long as there are only a few users watching tournaments at a time.

- [ ] Create example JSON for game queue object\
- [ ] REST endpoints
- [ ] Queue of games (Creating, running, modifying)
- [ ] Pass data to gameserver
- [ ] Listen for gameserver updates
- [ ] Relay updates to clients
- [ ] Perform mocked actions on game end (recording game stats, updating elo)
- [ ] Dockerize 