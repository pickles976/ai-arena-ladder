#!/bin/bash
killall --regexp *

docker restart $(docker ps -a -q)