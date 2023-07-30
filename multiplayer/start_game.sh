#!/bin/bash

DROPLET_IP=$DROPLET_IP
SUPABASE_SECRET_KEY=$SUPABASE_SECRET_KEY

echo "$DROPLET_IP"
echo "$SUPABASE_SECRET_KEY"

killall beanstalkd
killall node

echo "Starting Beanstalkd server..."
beanstalkd -l 127.0.0.1 -p 11300 &

echo "Starting campaign server..."
node --es-module-specifier-resolution=node ./campaign_server/campaign.js &

echo "Waiting for campaign server initialization..."
sleep 5

echo "Starting battle server..."
node --es-module-specifier-resolution=node ./battle_server/battle.js &

echo "Done!"
