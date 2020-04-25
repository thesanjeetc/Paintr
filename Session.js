class Controller {
  constructor(socket, session) {
    this.session = session;
    console.log("Controller Connected.");
  }
}

class Session {
  constructor(socket, roomID) {
    socket.on("connection", (client) => {
      client.on("controller", () => new Controller(client, this));
    });
  }
}

module.exports = Session;
