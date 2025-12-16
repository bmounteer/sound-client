import WebSocket from 'ws';
import { exec } from 'child_process';
import * as path from 'path';

class SoundListener {
  private ws: WebSocket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'ws://localhost:8080') {
    this.serverUrl = serverUrl;
    this.connect();
  }

  private connect(): void {
    console.log('Connecting to controller...');
    this.ws = new WebSocket(this.serverUrl);

    this.ws.on('open', () => {
      console.log('Connected to controller');
    });

    this.ws.on('message', (data: WebSocket.Data) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });

    this.ws.on('close', () => {
      console.log('Disconnected from controller. Reconnecting in 5 seconds...');
      setTimeout(() => this.connect(), 5000);
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMessage(message: any): void {
    if (message.type === 'play' && message.sound) {
      this.playSound(message.sound.path);
    }
  }

  private playSound(soundPath: string): void {
    console.log(`Playing sound: ${path.basename(soundPath)}`);
    
    // Use different commands based on the operating system
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      // macOS
      command = `afplay "${soundPath}"`;
    } else if (platform === 'win32') {
      // Windows
      command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
    } else {
      // Linux
      command = `aplay "${soundPath}" || paplay "${soundPath}" || mpg123 "${soundPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error playing sound: ${error.message}`);
        return;
      }
      if (stderr) {
        console.error(`Sound player stderr: ${stderr}`);
        return;
      }
      console.log('Sound played successfully');
    });
  }
}

// Start the listener
const listener = new SoundListener();

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down listener...');
  process.exit(0);
});