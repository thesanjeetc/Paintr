var app = require("express")();
var path = require("path");
const { createLogger, format, transports, addColors } = require("winston");
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

const myCustomLevels = {
  levels: {
    "Num. Sessions": 0,
    "Latest Sessions": 1,
    Connected: 2,
  },
  colors: {
    "Num. Sessions": "red",
    "Latest Sessions": "blue",
    Connected: "yellow",
  },
};

const logger = createLogger({
  level: "Connected",
  levels: myCustomLevels.levels,
  format: format.combine(format.colorize(), format.simple()),
  transports: [new transports.Console()],
});

addColors(myCustomLevels.colors);

app.use(express.static(path.join(__dirname, "client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/client/build/index.html"));
});

server.listen(process.env.PORT || 80);

let liveSessions = {};
let numSessions = 0;

if (process.env.NODE_ENV !== "production") {
  setInterval(() => {
    logger.log("Connected", io.eio.clientsCount);
    logger.log("Num. Sessions", numSessions);
    logger.log(
      "Latest Sessions",
      " " + Object.keys(liveSessions).slice(0).slice(-8)
    );
  }, 3000);
}

io.on("connection", (client) => {
  let roomID = client.handshake.query["room"];
  if (liveSessions[roomID] === undefined && roomID !== "") {
    numSessions += 1;
    let sessionSocket = io.of("/" + roomID);
    liveSessions[roomID] = new Session(sessionSocket, roomID, () => {
      sessionSocket.removeAllListeners();
      delete io.nsps["/" + roomID];
      delete liveSessions[roomID];
      numSessions -= 1;
    });
  }
});
