The game server runs a single game instance as quickly as it can. Every other frame it passes the game state packets to the ladder server via websockets. Every second it passes the score to the ladder via websockets.

If a game has not terminated within 27000 timesteps (15 min realtime) the game will terminate with a tie.

Game packets are ~1.5Kbps, sent 15x per second.

- [x] Port to Node.js
- [x] Sync via websockets
- [ ] Listen for input via Websocket
- [ ] Run on input, return to waiting on game end
- [ ] Dockerize