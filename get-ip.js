const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

console.log('Controller IP:', getLocalIP());
console.log('Use this command on other computers:');
console.log(`node dist/listener.js --server ws://${getLocalIP()}:8080`);