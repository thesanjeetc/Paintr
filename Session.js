var painters = {};
var paths = {};

class Controller {
  constructor(socket, session) {
    this.depth = 600;

    this.session = session;
    this.handleConnect(socket);

    socket.on("draw", (data) => this.handleDraw(data));
    socket.on("calibrate", (data) => this.handleCalibrate(data));
    socket.on("delete", (data) => this.handleDelete(data));
    socket.on("orientation", (data) => this.handleOrientation(data));
    socket.on("disconnect", () => this.handleDisconnect());
  }

  handleConnect(socket) {
    console.log("connected");
    socket.join("controllers");
    this.id = socket.id;
    this.session.create(this.id);
  }

  handleDraw(data) {
    this.session.draw(this.id, data);
  }

  handleCalibrate(data) {
    this.session.calibrate(this.id);
  }

  handleDelete(data) {
    this.session.delete(this.id);
  }

  handleOrientation(quaternion) {
    if (painters[this.id] !== undefined) {
      let angles = this.toEuler(quaternion);
      let dist = angles.map((angle, i) => {
        let initAngle = painters[this.id].initAngle;
        return this.calcDist(angle, initAngle[i]);
      });
      this.session.updatePos(this.id, angles, dist);
    }
  }

  toEuler(q) {
    let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
    let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
    let roll = Math.atan2(sinr_cosp, cosr_cosp);

    let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
    let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
    let yaw = Math.atan2(siny_cosp, cosy_cosp);
    return [yaw, roll];
  }

  calcDist(angle, initAngle) {
    angle = (angle - initAngle) * (180 / Math.PI);
    angle = angle < 0 ? angle + 360 : angle;
    angle = angle > 180 ? angle - 360 : angle;
    let dist = Math.round(-this.depth * Math.tan(angle * (Math.PI / 180)));
    return dist;
  }

  handleDisconnect(data) {
    this.session.remove(this.id);
  }
}

class Canvas {
  constructor(socket, session) {
    this.socket = socket;
    this.session = session;

    this.handleConnect(socket);
  }

  handleConnect(socket) {
    socket.join("canvases");
    socket.emit("sync", Object.values(painters), Object.values(paths));
  }
}

function Painter() {
  this.numCount = 0;
  this.initAngle = [0, 0];
  this.drawNum = -1;
  this.curPos = [0, 0];
  this.colour = "";
  this.lastPos = [0, 0];
  this.draw = 0;
}

class Session {
  constructor(socket, roomID) {
    this.socket = socket;
    this.roomID = roomID;

    this.colours = [
      "#f44336",
      "#E91E63",
      "#9C27B0",
      "#673AB7",
      "#3F51B5",
      "#2196F3",
      "#00BCD4",
      "#009688",
      "#4CAF50",
      "#8BC34A",
      "#CDDC39",
      "#FFEB3B",
      "#FFC107",
      "#FF9800",
      "#FF5722",
    ];

    this.numPainters = 0;
    this.painters = {};

    setInterval(() => this.socket.emit("update", Object.values(painters)), 30);

    socket.on("connection", (client) => {
      client.on("controller", () => new Controller(client, this));
      client.on("canvas", () => new Canvas(client, this));
    });
  }

  sync() {
    this.socket.emit("sync", Object.values(painters), Object.values(paths));
  }

  create(id) {
    let painter = new Painter();
    painters[id] = painter;
    paths[id] = [];
    this.numPainters += 1;

    let i = Math.floor(Math.random() * this.colours.length);
    let colour = this.colours.splice(i, 1)[0];
    painters[id].colour = colour;
    this.socket.to(id).emit("colour", colour);

    this.sync();
  }

  getAttr(id, attr) {
    return painters[id][attr];
  }

  updatePos(id, angles, dist) {
    if (painters[id].numCount === 0) {
      painters[id].initAngle = angles;
    } else {
      painters[id].lastPos = painters[id].curPos;
      painters[id].curPos = dist;
      if (painters[id].draw) {
        if (paths[id][painters[id].drawNum] === undefined) {
          paths[id][painters[id].drawNum] = [];
        }
        paths[id][painters[id].drawNum].push(dist);
      }
    }
    painters[id].numCount += 1;
  }

  draw(id, state) {
    if (state) {
      painters[id].draw = true;
      paths[id].push([]);
      painters[id].drawNum += 1;
    } else {
      painters[id].draw = false;
    }
  }

  calibrate(id) {
    painters[id].numCount = 0;
  }

  delete(id) {
    paths[id] = [];
    painters[id].drawNum = -1;
    this.sync();
  }

  remove(id) {
    this.colours.push(painters[id].colour);
    delete painters[id];
    delete paths[id];
    this.numPainters -= 1;
    this.sync();
  }
}

module.exports = Session;
