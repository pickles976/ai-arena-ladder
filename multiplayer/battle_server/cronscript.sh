#!/bin/bash
killall --regexp *

docker-compose up --scale battle-server=2 -d

docker restart $(docker ps -a -q)