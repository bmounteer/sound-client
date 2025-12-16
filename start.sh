#!/bin/bash

echo "Sound Client Launcher"
echo "===================="
echo "1. Controller (Web Interface)"
echo "2. Listener (Sound Player)"
echo "3. Both (Controller + Listener)"
echo ""
read -p "Choose mode (1-3): " choice

case $choice in
  1)
    echo "Starting controller..."
    npm run controller
    ;;
  2)
    echo "Starting listener..."
    npm run listener
    ;;
  3)
    echo "Starting both controller and listener..."
    npm run controller &
    sleep 2
    npm run listener
    ;;
  *)
    echo "Invalid choice"
    exit 1
    ;;
esac