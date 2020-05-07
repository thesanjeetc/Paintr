class Controller {
  constructor(socket, session) {
    this.depth = 800;

    this.session = session;
    this.handleConnect(socket);

    socket.on("draw", (data) => this.handleDraw(data));
    socket.on("calibrate", (data) => this.handleCalibrate(data));
    socket.on("delete", (data) => this.handleDelete(data));
    socket.on("orientation", (data) => this.handleOrientation(data));
    socket.on("colour", (data) => this.handleColour(data));
    socket.on("disconnect", () => this.handleDisconnect());
  }

  handleConnect(socket) {
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

  handleColour(data) {
    this.session.painters[this.id].colour = data;
  }

  handleOrientation(quaternion) {
    if (this.session.painters[this.id] !== undefined) {
      let angles = this.toEuler(quaternion);
      let dist = angles.map((angle, i) => {
        let initAngle = this.session.painters[this.id].initAngle;
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
    this.session.disconnect();
  }
}

class Canvas {
  constructor(socket, session) {
    this.socket = socket;
    this.session = session;

    this.handleConnect(socket);

    socket.on("resync", () => this.handleSync());
    socket.on("disconnect", () => this.handleDisconnect());
  }

  handleConnect(socket) {
    socket.join("canvases");
    let payload = [];
    socket.emit(
      "sync",
      Object.values(this.session.painters),
      Object.values(this.session.paths)
    );
  }

  handleSync(data) {
    this.session.sync();
  }

  handleDisconnect(data) {
    this.session.disconnect();
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
  constructor(socket, roomID, kill) {
    this.socket = socket;
    this.roomID = roomID;
    this.kill = kill;
    this.painters = {};
    this.paths = {};

    // Object.entries(socket.nsp.sockets).map(([id, s]) => {
    //   s.disconnect();
    // });
    // console.log(Object.keys(socket.nsp.sockets).length);

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

    setInterval(
      () => this.socket.emit("update", Object.values(this.painters)),
      50
    );

    setTimeout(() => this.close(), 1200000);

    socket.on("connection", (client) => {
      client.on("controller", () => new Controller(client, this));
      client.on("canvas", () => new Canvas(client, this));
    });
  }

  sync() {
    this.socket
      .to("canvases")
      .emit("sync", Object.values(this.painters), Object.values(this.paths));
  }

  create(id) {
    let painter = new Painter();
    this.painters[id] = painter;
    this.paths[id] = [];

    let i = Math.floor(Math.random() * this.colours.length);
    let colour = this.colours.splice(i, 1)[0];
    this.painters[id].colour = colour;
    this.socket.to(id).emit("colour", colour);

    this.sync();
  }

  getAttr(id, attr) {
    return this.painters[id][attr];
  }

  updatePos(id, angles, dist) {
    if (this.painters[id].numCount === 0) {
      this.painters[id].initAngle = angles;
    } else {
      this.painters[id].lastPos = this.painters[id].curPos;
      this.painters[id].curPos = dist;
      if (this.painters[id].draw) {
        if (this.paths[id][this.painters[id].drawNum] === undefined) {
          this.paths[id][this.painters[id].drawNum] = [];
        }
        this.paths[id][this.painters[id].drawNum].push(dist);
      }
    }
    this.painters[id].numCount += 1;
  }

  draw(id, state) {
    if (state) {
      this.painters[id].draw = true;
      this.paths[id].push([this.painters[id].colour]);
      this.painters[id].drawNum += 1;
    } else {
      this.painters[id].draw = false;
    }
  }

  calibrate(id) {
    this.painters[id].numCount = 0;
  }

  delete(id) {
    this.paths[id] = [];
    this.painters[id].drawNum = -1;
    this.sync();
  }

  remove(id) {
    this.colours.push(this.painters[id].colour);
    delete this.painters[id];
    delete this.paths[id];
    this.sync();
  }

  disconnect() {
    if (Object.keys(this.socket.connected).length === 0) {
      this.kill();
    }
  }

  close() {
    Object.entries(this.socket.sockets).map(([id, s]) => {
      s.disconnect();
    });
    this.kill();
  }
}

module.exports = Session;
