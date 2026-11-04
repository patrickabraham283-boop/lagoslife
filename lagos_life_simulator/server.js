const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "public")));

const players = new Map();
const PORT = process.env.PORT || 3000;

io.on("connection", (socket) => {
  const player = {
    id: socket.id,
    name: "Player",
    x: Math.random() * 8 - 4,
    y: 0,
    z: Math.random() * 8 - 4,
    rotation: 0,
    color: ["#ffb703", "#fb8500", "#90be6d", "#4cc9f0", "#f72585"][Math.floor(Math.random() * 5)],
    money: 25000
  };
  players.set(socket.id, player);
  socket.emit("welcome", { id: socket.id, players: [...players.values()] });
  socket.broadcast.emit("playerJoined", player);

  socket.on("setName", (name) => {
    const p = players.get(socket.id);
    if (!p) return;
    p.name = String(name || "Player").trim().slice(0, 16) || "Player";
    io.emit("playerMoved", p);
  });

  socket.on("move", (data) => {
    const p = players.get(socket.id);
    if (!p || !data) return;
    p.x = Math.max(-145, Math.min(145, Number(data.x) || 0));
    p.z = Math.max(-145, Math.min(145, Number(data.z) || 0));
    p.rotation = Number(data.rotation) || 0;
    io.emit("playerMoved", p);
  });

  socket.on("chat", (message) => {
    const p = players.get(socket.id);
    if (!p) return;
    const clean = String(message || "").trim().slice(0, 120);
    if (clean) io.emit("chatMessage", { name: p.name, message: clean, id: socket.id });
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
  });
});

server.listen(PORT, () => console.log(`Lagos Life Simulator running at http://localhost:${PORT}`));
