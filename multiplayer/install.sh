#!/bin/bash

echo "Installing dependencies"

cd campaign_server && npm install
cd ..

cd battle_server && npm install
cd ..

echo "Done!"