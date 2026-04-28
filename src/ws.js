const { WebSocketServer } = require('ws');
const { saveMessage, getMessages } = require('./db');

const rooms = new Map();

function getRoom(name) {
  if (!rooms.has(name)) rooms.set(name, new Set());
  return rooms.get(name);
}

function broadcast(room, data, exclude) {
  const payload = JSON.stringify(data);
  for (const client of getRoom(room)) {
    if (client !== exclude && client.readyState === 1) client.send(payload);
  }
}

function sendTo(ws, data) {
  if (ws.readyState === 1) ws.send(JSON.stringify(data));
}

function broadcastRoomUsers(room) {
  const users = [...getRoom(room)].map(c => c.username).filter(Boolean);
  const data = { type: 'users', room, users };
  for (const client of getRoom(room)) sendTo(client, data);
}

function broadcastRoomList() {
  const roomList = [...rooms.keys()];
  const data = { type: 'rooms', rooms: roomList };
  for (const [, clients] of rooms) {
    for (const client of clients) sendTo(client, data);
  }
}

function leaveRoom(ws) {
  const room = ws.room;
  if (!room) return;
  getRoom(room).delete(ws);
  broadcast(room, { type: 'system', content: `${ws.username} left the room`, room });
  broadcastRoomUsers(room);
  if (getRoom(room).size === 0) {
    rooms.delete(room);
    broadcastRoomList();
  }
}

function joinRoom(ws, room) {
  leaveRoom(ws);
  ws.room = room;
  getRoom(room).add(ws);

  sendTo(ws, { type: 'joined', room });

  // Send message history after joined (client clears on joined)
  const history = getMessages(room);
  sendTo(ws, { type: 'history', room, messages: history });

  broadcast(room, { type: 'system', content: `${ws.username} joined the room`, room }, ws);
  broadcastRoomUsers(room);
  broadcastRoomList();
}

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data);

      if (msg.type === 'join') {
        ws.username = msg.username;
        joinRoom(ws, msg.room || 'general');
        return;
      }

      if (msg.type === 'message' && ws.room) {
        const content = msg.content.trim();
        if (content.startsWith('/join ')) {
          const room = content.slice(6).replace(/^#/, '').trim();
          if (room) joinRoom(ws, room);
          return;
        }
        const timestamp = Date.now();
        saveMessage(ws.room, ws.username, content, timestamp);
        const payload = { type: 'message', username: ws.username, content, room: ws.room, timestamp };
        for (const client of getRoom(ws.room)) sendTo(client, payload);
      }
    });

    ws.on('close', () => {
      leaveRoom(ws);
      broadcastRoomList();
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
