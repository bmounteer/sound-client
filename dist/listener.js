"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = __importDefault(require("ws"));
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
class SoundListener {
    constructor(serverUrl = 'ws://localhost:8080') {
        this.ws = null;
        this.serverUrl = serverUrl;
        this.connect();
    }
    connect() {
        console.log('Connecting to controller...');
        this.ws = new ws_1.default(this.serverUrl);
        this.ws.on('open', () => {
            console.log('Connected to controller');
        });
        this.ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                this.handleMessage(message);
            }
            catch (error) {
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
    handleMessage(message) {
        if (message.type === 'play' && message.sound) {
            this.playSound(message.sound.path);
        }
    }
    playSound(soundPath) {
        console.log(`Playing sound: ${path.basename(soundPath)}`);
        // Use different commands based on the operating system
        const platform = process.platform;
        let command;
        if (platform === 'darwin') {
            // macOS
            command = `afplay "${soundPath}"`;
        }
        else if (platform === 'win32') {
            // Windows
            command = `powershell -c "(New-Object Media.SoundPlayer '${soundPath}').PlaySync()"`;
        }
        else {
            // Linux
            command = `aplay "${soundPath}" || paplay "${soundPath}" || mpg123 "${soundPath}"`;
        }
        (0, child_process_1.exec)(command, (error, stdout, stderr) => {
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
