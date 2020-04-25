var app = require("express")();
var path = require("path");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var express = require("express");

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

server.listen(process.env.PORT || 80);

io.on("connection", (client) => {
  console.log("Connected.");
});
