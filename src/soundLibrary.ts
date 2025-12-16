import * as fs from 'fs';
import * as path from 'path';

export interface SoundFile {
  name: string;
  category: string;
  path: string;
}

export class SoundLibrary {
  private sounds: SoundFile[] = [];
  private soundsDir: string;

  constructor(soundsDir: string = './src/sounds') {
    this.soundsDir = soundsDir;
    this.scanSounds();
  }

  private scanSounds(): void {
    this.sounds = [];
    this.scanDirectory(this.soundsDir, '');
  }

  private scanDirectory(dir: string, category: string): void {
    try {
      const items = fs.readdirSync(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        
        if (stat.isDirectory()) {
          const subCategory = category ? `${category}/${item}` : item;
          this.scanDirectory(fullPath, subCategory);
        } else if (item.endsWith('.mp3')) {
          const soundName = item.replace('.mp3', '');
          this.sounds.push({
            name: soundName,
            category: category || 'root',
            path: fullPath
          });
        }
      }
    } catch (error) {
      console.error(`Error scanning directory ${dir}:`, error);
    }
  }

  getAllSounds(): SoundFile[] {
    return this.sounds;
  }

  searchSounds(query: string): SoundFile[] {
    const lowerQuery = query.toLowerCase();
    return this.sounds.filter(sound => 
      sound.name.toLowerCase().includes(lowerQuery) ||
      sound.category.toLowerCase().includes(lowerQuery)
    );
  }

  getSoundByName(name: string): SoundFile | undefined {
    return this.sounds.find(sound => sound.name === name);
  }

  getCategories(): string[] {
    const categories = new Set(this.sounds.map(sound => sound.category));
    return Array.from(categories).sort();
  }
}