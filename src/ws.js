const { WebSocketServer } = require('ws');

function setupWebSocket(server) {
  const wss = new WebSocketServer({ server });

  wss.on('connection', (ws) => {
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      const payload = JSON.stringify(msg);
      for (const client of wss.clients) {
        if (client.readyState === 1) client.send(payload);
      }
    });
  });

  return wss;
}

module.exports = { setupWebSocket };
