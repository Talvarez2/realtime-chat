const ws = new WebSocket(`ws://${location.host}`);
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');
const roomList = document.getElementById('room-list');
const userList = document.getElementById('user-list');
const currentRoomEl = document.getElementById('current-room');
const newRoomInput = document.getElementById('new-room');
const typingEl = document.getElementById('typing');

const username = prompt('Enter your username:') || 'Anonymous';
let currentRoom = 'general';
const typingTimers = {};

// Emoji shortcodes
const emojis = {':)':'😊',':D':'😃',':(':'😢',':P':'😛',':o':'😮','<3':'❤️',':fire:':'🔥',':thumbsup:':'👍',':thumbsdown:':'👎',':wave:':'👋',':clap:':'👏',':100:':'💯',':rocket:':'🚀',':star:':'⭐',':check:':'✅',':x:':'❌',':eyes:':'👀',':laugh:':'😂',':think:':'🤔',':party:':'🎉'};

function renderMarkdown(text) {
  // Escape HTML
  text = text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  // Code blocks
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  // Italic
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');
  // Emoji shortcodes
  for (const [code, emoji] of Object.entries(emojis)) {
    text = text.split(code).join(emoji);
  }
  return text;
}

ws.onopen = () => ws.send(JSON.stringify({ type: 'join', username, room: currentRoom }));

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);

  if (msg.type === 'joined') {
    currentRoom = msg.room;
    currentRoomEl.textContent = '#' + msg.room;
    messages.innerHTML = '';
    return;
  }

  if (msg.type === 'history') {
    msg.messages.forEach(m => addMessage(m, m.content));
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

  if (msg.type === 'typing') {
    if (msg.room === currentRoom && msg.username !== username) showTyping(msg.username);
    return;
  }

  if (msg.type === 'system') {
    if (msg.room === currentRoom) addMessage(null, msg.content, true);
    return;
  }

  if (msg.type === 'message' && msg.room === currentRoom) {
    clearTyping(msg.username);
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
    div.innerHTML = `<div class="meta">${msg.username}</div><div>${renderMarkdown(content)}</div>`;
  }
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

function showTyping(user) {
  clearTimeout(typingTimers[user]);
  typingTimers[user] = setTimeout(() => clearTyping(user), 2000);
  updateTypingDisplay();
}

function clearTyping(user) {
  clearTimeout(typingTimers[user]);
  delete typingTimers[user];
  updateTypingDisplay();
}

function updateTypingDisplay() {
  const users = Object.keys(typingTimers);
  if (!users.length) { typingEl.textContent = ''; return; }
  typingEl.textContent = users.length === 1
    ? `${users[0]} is typing...`
    : `${users.join(', ')} are typing...`;
}

// Send typing indicator (throttled)
let lastTypingSent = 0;
input.oninput = () => {
  const now = Date.now();
  if (now - lastTypingSent > 1000) {
    ws.send(JSON.stringify({ type: 'typing' }));
    lastTypingSent = now;
  }
};

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
