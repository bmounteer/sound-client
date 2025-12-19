import express from 'express';
import WebSocket from 'ws';
import * as fs from 'fs';
import {SoundLibrary} from './soundLibrary';

const app = express();
const port = 3005;
const wsPort = 8400;

const soundLibrary = new SoundLibrary();
const wss = new WebSocket.Server({ port: wsPort, host: '0.0.0.0' });

app.use(express.static('public'));
app.use(express.json());

// API endpoints
app.get('/api/sounds', (req, res) => {
  const query = req.query.q as string;
  const sounds = query ? soundLibrary.searchSounds(query) : soundLibrary.getAllSounds();
  res.json(sounds);
});

app.get('/api/categories', (req, res) => {
  res.json(soundLibrary.getCategories());
});

app.post('/api/play', (req, res) => {
  const { soundName } = req.body;
  const sound = soundLibrary.getSoundByName(soundName);
  
  if (!sound) {
    return res.status(404).json({ error: 'Sound not found' });
  }

  try {
    const audioData = fs.readFileSync(sound.path);
    const base64Audio = audioData.toString('base64');
    
    // Broadcast to all connected listeners
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ 
          type: 'play', 
          sound: {
            name: sound.name,
            category: sound.category,
            audioData: base64Audio
          }
        }));
      }
    });

    res.json({ success: true, sound: { name: sound.name, category: sound.category } });
  } catch (error) {
    res.status(500).json({ error: 'Failed to read audio file' });
  }
});

// Serve the web interface
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html>
<head>
    <title>Sound Controller</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .search { margin-bottom: 20px; }
        .search input { padding: 10px; width: 300px; font-size: 16px; }
        .categories { margin-bottom: 20px; }
        .category { display: inline-block; margin: 5px; padding: 5px 10px; background: #f0f0f0; border-radius: 3px; cursor: pointer; }
        .category:hover { background: #e0e0e0; }
        .sounds { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px; }
        .sound { padding: 10px; border: 1px solid #ddd; border-radius: 5px; cursor: pointer; }
        .sound:hover { background: #f5f5f5; }
        .sound-name { font-weight: bold; }
        .sound-category { font-size: 12px; color: #666; }
        .status { position: fixed; top: 10px; right: 10px; padding: 10px; background: #4CAF50; color: white; border-radius: 5px; display: none; }
    </style>
</head>
<body>
    <h1>Sound Controller</h1>
    
    <div class="search">
        <input type="text" id="searchInput" placeholder="Search sounds..." onkeyup="searchSounds()">
    </div>
    
    <div class="categories" id="categories"></div>
    
    <div class="sounds" id="sounds"></div>
    
    <div class="status" id="status"></div>

    <script>
        let allSounds = [];
        let allCategories = [];

        async function loadSounds() {
            const response = await fetch('/api/sounds');
            allSounds = await response.json();
            displaySounds(allSounds);
        }

        async function loadCategories() {
            const response = await fetch('/api/categories');
            allCategories = await response.json();
            displayCategories();
        }

        function displaySounds(sounds) {
            const container = document.getElementById('sounds');
            container.innerHTML = sounds.map(sound => \`
                <div class="sound" onclick="playSound('\${sound.name}')">
                    <div class="sound-name">\${sound.name}</div>
                    <div class="sound-category">\${sound.category}</div>
                </div>
            \`).join('');
        }

        function displayCategories() {
            const container = document.getElementById('categories');
            container.innerHTML = allCategories.map(category => \`
                <div class="category" onclick="filterByCategory('\${category}')">\${category}</div>
            \`).join('');
        }

        function searchSounds() {
            const query = document.getElementById('searchInput').value;
            if (query) {
                fetch(\`/api/sounds?q=\${encodeURIComponent(query)}\`)
                    .then(response => response.json())
                    .then(sounds => displaySounds(sounds));
            } else {
                displaySounds(allSounds);
            }
        }

        function filterByCategory(category) {
            const filtered = allSounds.filter(sound => sound.category === category);
            displaySounds(filtered);
            document.getElementById('searchInput').value = '';
        }

        async function playSound(soundName) {
            try {
                const response = await fetch('/api/play', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ soundName })
                });
                
                if (response.ok) {
                    showStatus('Playing: ' + soundName);
                } else {
                    showStatus('Error playing sound', true);
                }
            } catch (error) {
                showStatus('Error: ' + error.message, true);
            }
        }

        function showStatus(message, isError = false) {
            const status = document.getElementById('status');
            status.textContent = message;
            status.style.background = isError ? '#f44336' : '#4CAF50';
            status.style.display = 'block';
            setTimeout(() => status.style.display = 'none', 2000);
        }

        // Load data on page load
        loadSounds();
        loadCategories();
    </script>
</body>
</html>
  `);
});

wss.on('connection', (ws) => {
  console.log('Listener connected');
  ws.on('close', () => console.log('Listener disconnected'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Controller running at http://localhost:${port}`);
  console.log(`WebSocket server running on port ${wsPort}`);
});