# Game Server

The game server runs a single game instance as quickly as it can. After a specified number of game ticks it sends game state packets to the ladder server via websockets. Every second or so it passes the score to the ladder via websockets.

If a game has not terminated within 54000 timesteps (30 min realtime) the game will terminate with a tie.

Game packets are ~12Kbps, sent 30x per second. This is sufficiently small for even the smallest EC2 instance.

How user code is sanitized:

- Parse user code to AST tree to extract line numbers of loops
- inject timeouts into any loop
- All injected variables have a random UUID (can't be overridden if the user doesn't know their name)
- check for memory bombs at the end of user code (users can only allocate 8kb of memory per agent)
