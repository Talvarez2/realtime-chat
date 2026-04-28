const ws = new WebSocket(`ws://${location.host}`);
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const roomList = document.getElementById('room-list');
const userList = document.getElementById('user-list');
const currentRoomEl = document.getElementById('current-room');
const newRoomInput = document.getElementById('new-room');

const username = prompt('Enter your username:') || 'Anonymous';
let currentRoom = 'general';

ws.onopen = () => ws.send(JSON.stringify({ type: 'join', username, room: currentRoom }));

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'joined') {
    currentRoom = msg.room;
    currentRoomEl.textContent = '#' + msg.room;
    messages.innerHTML = '';
    return;
  }

  if (msg.type === 'rooms') {
    roomList.innerHTML = msg.rooms.map(r =>
      `<li class="${r === currentRoom ? 'active' : ''}" data-room="${r}">#${r}</li>`
    ).join('');
    return;
  }

  if (msg.type === 'users') {
    if (msg.room === currentRoom) {
      userList.innerHTML = msg.users.map(u => `<li>${u}</li>`).join('');
    }
    return;
  }

  if (msg.type === 'system') {
    if (msg.room === currentRoom) addMessage(null, msg.content, true);
    return;
  }

  if (msg.type === 'message' && msg.room === currentRoom) {
    addMessage(msg, msg.content);
  }
};

function addMessage(msg, content, isSystem) {
  const div = document.createElement('div');
  if (isSystem) {
    div.className = 'message system';
    div.textContent = content;
  } else {
    div.className = 'message' + (msg.username === username ? ' self' : '');
    div.innerHTML = `<div class="meta">${msg.username}</div><div>${content}</div>`;
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

form.onsubmit = (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  ws.send(JSON.stringify({ type: 'message', content }));
  input.value = '';
};

roomList.onclick = (e) => {
  const room = e.target.dataset.room;
  if (room && room !== currentRoom) {
    ws.send(JSON.stringify({ type: 'join', username, room }));
  }
};

newRoomInput.onkeydown = (e) => {
  if (e.key === 'Enter') {
    const room = newRoomInput.value.replace(/^#/, '').trim();
    if (room) {
      ws.send(JSON.stringify({ type: 'join', username, room }));
      newRoomInput.value = '';
    }
  }
};
