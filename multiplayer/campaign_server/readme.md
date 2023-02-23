Campaign

The Campaign server runs the galaxy map headless and plays a strategic turn-based game.
When a battle occurs it is sent to a Beanstalkd queue and grabbed by a game server.

The Campaign server also periodically checks a different queue to see if battles have completed.
If a battle is completed, the Campaign server will resolve that battle on the map.

The Campaign server makes sure that there are no more than 10 items in the queue at any given time.

## TODO:
- [x] Add 2-way communication with Beanstalkd
- [ ] Add Galaxy generation with bogus data
- [ ] Set up coin flip on battle server + game outcome resolution
- [ ] Add db interaction to Campaign server