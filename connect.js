const readline = require('readline');
const { spawn } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Controller IP: ', (ip) => {
  if (!ip) {
    console.log('No IP provided, using localhost');
    ip = 'localhost';
  }
  
  console.log(`Connecting to ws://${ip}:8400`);
  spawn('node', ['dist/listener.js', '--server', `ws://${ip}:8400`], {
    stdio: 'inherit'
  });
  
  rl.close();
});