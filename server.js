const express = require("express");
const app = express();
const server = require("http").Server(app);
const { ExpressPeerServer } = require("peer");
const PeerServer = ExpressPeerServer(server, {
  debug: true,
});
const { v4: uuidV4 } = require("uuid");
const io = require("socket.io")(server);
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", PeerServer);

app.get("/", (req, res) => {
  res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit("user-connected", userId);
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message);
    });
  });
});
server.listen(process.env.PORT || 3000);
