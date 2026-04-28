const ws = new WebSocket(`ws://${location.host}`);
const messages = document.getElementById('messages');
const form = document.getElementById('form');
const input = document.getElementById('input');

const username = prompt('Enter your username:') || 'Anonymous';

ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  const div = document.createElement('div');
  div.className = 'message' + (msg.username === username ? ' self' : '');
  div.innerHTML = `<div class="meta">${msg.username}</div><div>${msg.content}</div>`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
};

form.onsubmit = (e) => {
  e.preventDefault();
  const content = input.value.trim();
  if (!content) return;
  ws.send(JSON.stringify({ type: 'message', username, content }));
  input.value = '';
};
