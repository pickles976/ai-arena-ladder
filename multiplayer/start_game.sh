#!/bin/bash

DROPLET_IP=$DROPLET_IP
SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY

killall beanstalkd
killall node

echo "Starting Beanstalkd server..."
beanstalkd -l localhost -p 11300 &

echo "Starting campaign server..."
cd campaign_server && node --es-module-specifier-resolution=node ./campaign.js &

echo "Waiting for campaign server initialization..."
sleep 5

echo "Starting battle server..."
cd ../battle_server && node --es-module-specifier-resolution=node ./battle.js &

echo "Done!"
