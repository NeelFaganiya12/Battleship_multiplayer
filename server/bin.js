const express = require("express");
const http = require("http");
const WebSocket = require("ws");
const app = express();

const socketio = require("socket.io");

const server = http.createServer(app);
const io = socketio(server);

const path = require("path");

app.use(express.static(__dirname + "/public"));
app.use(express.static("../public"));

app.get("/", (req, res) => {
  return res.sendFile(`../public/assets/styles.css`);
});

const port = 3000;
server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

const connections = [null, null];
io.on("connection", (socket) => {
  let playerIndex = -1;
  for (const i in connections) {
    if (connections[i] === null) {
      playerIndex = i;
      break;
    }
  }

  socket.emit("player-number", playerIndex);

  console.log(`Player ${playerIndex} has connection`);

  if (playerIndex === -1) return;

  connections[playerIndex] = false;

  socket.broadcast.emit("player-connection", playerIndex);

  socket.on("player-ready", () => {
    socket.broadcast.emit("enemy-ready", playerIndex);
    connections[playerIndex] = true;
  });

  socket.on("check-players", () => {
    const players = [];
    for (const i in connections) {
      connections[i] === null
        ? players.push({ connected: false, ready: false })
        : players.push({ connected: true, ready: connections[i] });
    }
    socket.emit("check-players", players);
  });

  socket.on("fire", (e) => {
    socket.broadcast.emit("fire", e);
  });

  socket.on("reply-fire", (msg) => {
    socket.broadcast.emit("reply-fire", msg);
  });

  socket.on("game-over", () => {
    socket.broadcast.emit("game-over");
  });

  socket.on("full-boat-destroyed", (msg) => {
    socket.broadcast.emit("full-boat-destroyed", msg);
  });
});
