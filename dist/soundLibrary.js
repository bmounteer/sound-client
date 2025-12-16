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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SoundLibrary = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class SoundLibrary {
    constructor(soundsDir = './src/sounds') {
        this.sounds = [];
        this.soundsDir = soundsDir;
        this.scanSounds();
    }
    scanSounds() {
        this.sounds = [];
        this.scanDirectory(this.soundsDir, '');
    }
    scanDirectory(dir, category) {
        try {
            const items = fs.readdirSync(dir);
            for (const item of items) {
                const fullPath = path.join(dir, item);
                const stat = fs.statSync(fullPath);
                if (stat.isDirectory()) {
                    const subCategory = category ? `${category}/${item}` : item;
                    this.scanDirectory(fullPath, subCategory);
                }
                else if (item.endsWith('.mp3')) {
                    const soundName = item.replace('.mp3', '');
                    this.sounds.push({
                        name: soundName,
                        category: category || 'root',
                        path: fullPath
                    });
                }
            }
        }
        catch (error) {
            console.error(`Error scanning directory ${dir}:`, error);
        }
    }
    getAllSounds() {
        return this.sounds;
    }
    searchSounds(query) {
        const lowerQuery = query.toLowerCase();
        return this.sounds.filter(sound => sound.name.toLowerCase().includes(lowerQuery) ||
            sound.category.toLowerCase().includes(lowerQuery));
    }
    getSoundByName(name) {
        return this.sounds.find(sound => sound.name === name);
    }
    getCategories() {
        const categories = new Set(this.sounds.map(sound => sound.category));
        return Array.from(categories).sort();
    }
}
exports.SoundLibrary = SoundLibrary;
