var osutils = require("os-utils");
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
    https.get("https://airscribe.herokuapp.com/").on("error", (err) => {
      console.log("Ping Error: " + err.message);
    });
  }, 1500000);
};

server.listen(process.env.PORT || 80, () => {
  wakeUpDyno();
});

let logging = false;

if (logging) {
  setInterval(() => {
    console.log("Platform: " + osutils.platform());
    console.log("Number of CPUs: " + osutils.cpuCount());
    osutils.cpuUsage(function (v) {
      console.log("CPU Usage (%) : " + v);
    });
    console.log("Load Average (5m): " + osutils.loadavg(5));
    console.log("Total Memory: " + osutils.totalmem() + "MB");
    console.log("Free Memory: " + osutils.freemem() + "MB");
    console.log("Free Memory (%): " + osutils.freememPercentage());
    console.log("System Uptime: " + osutils.sysUptime() + "ms");
  }, 1000);
}

let liveSessions = {};

io.on("connection", (client) => {
  let roomID = client.handshake.query["room"];
  if (liveSessions[roomID] === undefined && roomID !== "") {
    let sessionSocket = io.of("/" + roomID);
    liveSessions[roomID] = new Session(sessionSocket, roomID);
  }
});
