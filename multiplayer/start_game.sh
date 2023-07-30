#!/bin/bash

echo "Starting Beanstalkd server..."
beanstalkd -l localhost -p 11300

echo "Starting campaign server..."
cd campaign_server && node --es-module-specifier-resolution=node ./campaign.js
cd ..

echo "Starting battle server..."
cd battle_server && node --es-module-specifier-resolution=node ./battle.js
cd ..

echo "Done!"
