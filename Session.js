class Controller {
  constructor(socket, session) {
    this.session = session;
    this.handleConnect(socket);

    socket.on("draw", (data) => this.handleDraw(data));
    socket.on("calibrate", (data) => this.handleCalibrate(data));
    socket.on("delete", (data) => this.handleDelete(data));
    socket.on("orientation", (data) => this.handleOrientation(data));
    socket.on("disconnect", () => this.handleDisconnect());
  }

  handleConnect(socket) {
    socket.join("controllers");
  }

  handleDraw(data) {
    console.log("Drawing is " + data);
  }

  handleCalibrate(data) {
    console.log("Calibrated.");
  }

  handleDelete(data) {
    console.log("Cleared.");
  }

  handleOrientation(quaternion) {
    let angles = this.toEuler(quaternion);
    console.log(angles);
  }

  // Wikipedia Implementation in JS

  toEuler(q) {
    let sinr_cosp = 2 * (q[3] * q[0] + q[1] * q[2]);
    let cosr_cosp = 1 - 2 * (q[0] * q[0] + q[1] * q[1]);
    let roll = Math.atan2(sinr_cosp, cosr_cosp);

    let siny_cosp = 2 * (q[3] * q[2] + q[0] * q[1]);
    let cosy_cosp = 1 - 2 * (q[1] * q[1] + q[2] * q[2]);
    let yaw = Math.atan2(siny_cosp, cosy_cosp);
    return [yaw, roll];
  }

  handleDisconnect() {
    console.log("Disconnected.");
  }
}

class Canvas {
  constructor(socket, session) {
    this.session = session;
    this.handleConnect(socket);
  }

  handleConnect(socket) {
    socket.join("canvases");
  }
}

class Session {
  constructor(socket, roomID) {
    socket.on("connection", (client) => {
      client.on("controller", () => new Controller(client, this));
      client.on("canvas"), () => new Canvas(client, this);
    });
  }
}

module.exports = Session;
