const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.static(path.join(__dirname, 'public')));

// Store all connected players
const players = new Map();

// Random spawn position in the cosmos
function randomSpawn() {
  return {
    x: (Math.random() - 0.5) * 2000,
    y: (Math.random() - 0.5) * 2000,
  };
}

// Generate random hue for avatar color
function randomHue() {
  return Math.floor(Math.random() * 360);
}

// Star field seed (shared across all clients)
const STAR_SEED = Math.floor(Math.random() * 1000000);

wss.on('connection', (ws) => {
  const id = uuidv4();
  const spawn = randomSpawn();
  const hue = randomHue();

  const player = {
    id,
    x: spawn.x,
    y: spawn.y,
    angle: 0,
    hue,
    name: '',
    karma: 0,
    speed: 0,
  };

  players.set(id, { ws, data: player });

  // Send the new player their ID and existing players
  const existingPlayers = [];
  players.forEach((p, pid) => {
    if (pid !== id) {
      existingPlayers.push(p.data);
    }
  });

  ws.send(JSON.stringify({
    type: 'init',
    id,
    player,
    players: existingPlayers,
    starSeed: STAR_SEED,
  }));

  // Notify all others about the new player
  broadcast({ type: 'player_join', player }, id);

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);

      switch (msg.type) {
        case 'update': {
          const p = players.get(id);
          if (p) {
            p.data.x = msg.x;
            p.data.y = msg.y;
            p.data.angle = msg.angle;
            p.data.speed = msg.speed;
            p.data.name = msg.name || p.data.name;

            broadcast({
              type: 'player_update',
              id,
              x: msg.x,
              y: msg.y,
              angle: msg.angle,
              speed: msg.speed,
              name: msg.name || p.data.name,
            }, id);
          }
          break;
        }

        case 'set_name': {
          const p = players.get(id);
          if (p) {
            p.data.name = msg.name.slice(0, 20);
            broadcast({
              type: 'player_name',
              id,
              name: p.data.name,
            }, id);
          }
          break;
        }

        case 'chat': {
          broadcast({
            type: 'chat',
            id,
            message: (msg.message || '').slice(0, 140),
          });
          break;
        }

        case 'collect': {
          // Player collected a celestial object
          const p = players.get(id);
          if (p && typeof msg.karma === 'number') {
            p.data.karma += msg.karma;
            // Broadcast the collection so all clients remove this object
            broadcast({
              type: 'collect',
              playerId: id,
              objectId: msg.objectId,
              karma: p.data.karma,
              change: msg.karma,
            });
          }
          break;
        }
      }
    } catch (e) {
      // Ignore malformed messages
    }
  });

  ws.on('close', () => {
    players.delete(id);
    broadcast({ type: 'player_leave', id });
  });
});

function broadcast(msg, excludeId = null) {
  const data = JSON.stringify(msg);
  players.forEach((p, pid) => {
    if (pid !== excludeId && p.ws.readyState === 1) {
      p.ws.send(data);
    }
  });
}

const PORT = process.env.PORT || 3456;
server.listen(PORT, () => {
  console.log(`✦ Samsara is running on http://localhost:${PORT}`);
});
