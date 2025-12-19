#!/usr/bin/env node

import {program} from 'commander';

program
  .name('sound-client')
  .description('Sound effects client with controller and listener modes')
  .version('1.0.0');

program
  .command('controller')
  .description('Start the controller web interface')
  .action(() => {
    require('./controller');
  });

program
  .command('listener')
  .description('Start the listener to play sounds')
  .option('-s, --server <url>', 'WebSocket server URL', 'ws://localhost:8400')
  .action((options) => {
    process.env.SERVER_URL = options.server;
    require('./listener');
  });

program.parse();