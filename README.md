# Sound Client

A simple sound effects player with controller and listener modes.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the project:
```bash
npm run build
```

## Usage

### Controller Mode
Start the web interface to browse and play sounds:
```bash
npm run controller
```
Then open http://localhost:3000 in your browser.

### Listener Mode
Start a listener on the device where you want sounds to play:
```bash
npm run listener
```

### Custom Server
If running the listener on a different machine:
```bash
node dist/listener.js --server ws://controller-ip:8080
```

## Features

- **Web Interface**: Browse sounds by category or search by name
- **Real-time Communication**: WebSocket connection between controller and listeners
- **Cross-platform Audio**: Works on macOS, Windows, and Linux
- **Auto-reconnect**: Listeners automatically reconnect if disconnected
- **Search**: Find sounds quickly by name or category

## File Structure

- `src/sounds/` - Your sound effects library (organized by folders)
- `src/controller.ts` - Web server and controller logic
- `src/listener.ts` - Sound player client
- `src/soundLibrary.ts` - Sound file scanner and search