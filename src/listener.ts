import WebSocket from 'ws';
import {exec} from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

class SoundListener {
  private ws: WebSocket | null = null;
  private serverUrl: string;

  constructor(serverUrl: string = 'ws://localhost:8400') {
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
      if (message.sound.audioData) {
        this.playSoundFromData(message.sound.name, message.sound.audioData);
      } else {
        this.playSound(message.sound.path);
      }
    }
  }

  private playSoundFromData(soundName: string, base64Data: string): void {
    console.log(`Playing sound: ${soundName}`);
    
    const tempDir = os.tmpdir();
    const tempFile = path.join(tempDir, `sound_${Date.now()}.mp3`);
    
    try {
      const audioBuffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(tempFile, audioBuffer);
      
      this.playSound(tempFile, () => {
        fs.unlinkSync(tempFile);
      });
    } catch (error) {
      console.error(`Error creating temp file: ${error}`);
    }
  }

  private playSound(soundPath: string, callback?: () => void): void {
    const platform = process.platform;
    let command: string;

    if (platform === 'darwin') {
      command = `afplay "${soundPath}"`;
    } else if (platform === 'win32') {
      command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
    } else {
      command = `aplay "${soundPath}" || paplay "${soundPath}" || mpg123 "${soundPath}"`;
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error playing sound: ${error.message}`);
      } else {
        console.log('Sound played successfully');
      }
      if (callback) callback();
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