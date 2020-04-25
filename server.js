var app = require("express")();
var path = require("path");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var express = require("express");
var Session = require("./Session.js");

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

server.listen(process.env.PORT || 80);

let liveSessions = {};

io.on("connection", (client) => {
  let roomID = client.handshake.query["room"];
  if (liveSessions[roomID] === undefined && roomID !== "") {
    let sessionSocket = io.of("/" + roomID);
    liveSessions[roomID] = new Session(sessionSocket, roomID);
  }
});
