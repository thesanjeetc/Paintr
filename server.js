var app = require("express")();
var path = require("path");
var server = require("http").Server(app);
const https = require("https");

if (process.env.NODE_ENV === "production") {
  var io = require("socket.io")(server, {
    origins: "https://paintr.sanjeet.co:*",
  });
} else {
  var io = require("socket.io")(server);
}

var express = require("express");
var Session = require("./Session.js");

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

const wakeUpDyno = () => {
  setInterval(() => {
    https.get("https://paintr.sanjeet.co/").on("error", (err) => {
      console.log("Ping Error: " + err.message);
    });
  }, 1500000);
};

server.listen(process.env.PORT || 80, () => {
  wakeUpDyno();
});

let liveSessions = {};

setInterval(() => {
  console.log(Object.keys(liveSessions));
}, 5000);

io.on("connection", (client) => {
  let roomID = client.handshake.query["room"];
  if (liveSessions[roomID] === undefined && roomID !== "") {
    let sessionSocket = io.of("/" + roomID);
    liveSessions[roomID] = new Session(sessionSocket, roomID, () => {
      sessionSocket.removeAllListeners();
      delete io.nsps["/" + roomID];
      delete liveSessions[roomID];
    });
  }
});
