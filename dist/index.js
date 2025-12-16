#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
commander_1.program
    .name('sound-client')
    .description('Sound effects client with controller and listener modes')
    .version('1.0.0');
commander_1.program
    .command('controller')
    .description('Start the controller web interface')
    .action(() => {
    require('./controller');
});
commander_1.program
    .command('listener')
    .description('Start the listener to play sounds')
    .option('-s, --server <url>', 'WebSocket server URL', 'ws://localhost:8080')
    .action((options) => {
    process.env.SERVER_URL = options.server;
    require('./listener');
});
commander_1.program.parse();
