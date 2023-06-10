# Multiplayer Server

The multiplayer server is super simple, like everything else in this project I tried to keep it basic.

## Campaign Server

The Campaign server consists of a node js program and a beanstalkd queue.

The nodejs program generates a galaxy and hits the supabase db for user info. It seeds the stars with users, this is their
"starting system" the program then starts looping over all the active systems and taking turns for the players. Collecting their resources,
conquering nearby systems, and attacking enemies.

When a nearby system is occupied, a user can attack it. This queues up a game to the beanstalk queue. The queue can only have 5 games queued at a time.

https://xobotyi.github.io/node-beanstalk

## Battle Server

The Battle server just listens to the queue and pulls down a job. It loads up a game and runs it to completion, then returns the endgame data to the 
campaign server.


```mermaid
graph LR;
    GameServer-->|GameState|Ladder;
    Ladder-->|GameParams|GameServer;
    API-->|GameInfo|Ladder;
```

## Deploying to DigitalOcean

Deployment is currently manual

### Detaching from console

[https://askubuntu.com/questions/8653/how-to-keep-processes-running-after-ending-ssh-session](https://askubuntu.com/questions/8653/how-to-keep-processes-running-after-ending-ssh-session)

Use screen to create a detachable command. Type screen, 
then run your command. After it has started, press CTRL + A then CTRL + D to detach. 

### Campaign
1. Clone the repo to your Droplet
2. cd into the multiplayer folder
3. In ./campaign_server run docker-compose up to run the campaign server. You will need to set the environment variables:
```
 export DROPLET_IP=""
 export SUPABASE_SECRET_KEY=""
```
Where DROPLET_IP is the IP of the current droplet

### Battle
1. Clone the repo to your Droplet
2. cd into the multiplayer folder
3. In ./battle_server run docker-compose up to run the battle server. You will need to set the environment variables:
```
 export DROPLET_IP=""
```
Where DROPLET_IP is the IP of the campaign droplet

