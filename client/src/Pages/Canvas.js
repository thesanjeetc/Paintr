import React from "react";
import io from "socket.io-client";

class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    let roomID = props.roomID;

    let address =
      process.env.NODE_ENV === "production"
        ? "https://paintr-app.sanjeet.co/"
        : window.location.hostname + "/";

    this.socket = io.connect(address + roomID, {
      query: { room: roomID },
      // reconnection: true,
      // reconnectionDelay: 1000,
      // reconnectionDelayMax: 5000,
      // reconnectionAttempts: Infinity,
    });

    this.socket.emit("canvas");

    var pathCanvas = document.createElement("canvas");
    var pointerCanvas = document.createElement("canvas");

    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;
    this.offset = [this.canvasWidth / 2, this.canvasHeight / 2];

    pathCanvas.setAttribute("width", this.canvasWidth);
    pathCanvas.setAttribute("height", this.canvasHeight);
    pointerCanvas.setAttribute("width", this.canvasWidth);
    pointerCanvas.setAttribute("height", this.canvasHeight);

    window.addEventListener("resize", () => {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;

      pathCanvas.setAttribute("width", this.canvasWidth);
      pathCanvas.setAttribute("height", this.canvasHeight);
      pointerCanvas.setAttribute("width", this.canvasWidth);
      pointerCanvas.setAttribute("height", this.canvasHeight);

      this.offset = [this.canvasWidth / 2, this.canvasHeight / 2];

      this.pathctx.lineJoin = "round";
      this.pathctx.lineCap = "round";
      this.pathctx.lineWidth = 7;

      this.socket.emit("resync");
    });

    pathCanvas.setAttribute("id", "pathCanvas");
    pointerCanvas.setAttribute("id", "pointerCanvas");

    this.painters = [];
    this.paths = [];
    this.lastPos = [];
    this.redraw = false;

    this.pathCanvas = pathCanvas;
    this.pointerCanvas = pointerCanvas;
  }

  componentDidMount() {
    this.canvasBox = document.getElementById("canvasContainer");
    this.canvasBox.appendChild(this.pathCanvas);
    this.canvasBox.appendChild(this.pointerCanvas);

    this.pathctx = this.pathCanvas.getContext("2d");
    this.pathctx.lineJoin = "round";
    this.pathctx.lineCap = "round";
    this.pathctx.lineWidth = 7;

    this.pointerctx = this.pointerCanvas.getContext("2d");

    this.socket.on("sync", (painters, paths) => {
      this.painters = painters;
      this.paths = paths;
      this.redraw = true;
    });

    this.socket.on("update", (painters) => {
      this.painters = painters;
    });

    this.socket.on("disconnect", () => {
      alert(
        "Your session has ended. Please reload this page and reconnect your controller to continue."
      );
    });

    this.draw();
  }

  draw() {
    this.drawPointers();
    if (this.redraw) {
      this.drawPath();
      this.redraw = false;
    } else {
      this.updatePath();
    }
    requestAnimationFrame(() => this.draw());
  }

  drawPointers() {
    this.pointerctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.painters.forEach((painter, i) => {
      let curPos = [
        painter.curPos[0] + this.offset[0],
        painter.curPos[1] + this.offset[1],
      ];

      this.pointerctx.beginPath();
      this.pointerctx.arc(...curPos, 20, 0, 2 * Math.PI);
      this.pointerctx.fillStyle = this.painters[i].colour;
      this.pointerctx.fill();
      this.pointerctx.closePath();
    });
  }

  updatePath() {
    this.painters.forEach((painter, i) => {
      if (this.lastPos[i] === undefined) {
        this.lastPos[i] = painter.curPos;
      }

      let lastPos = [
        this.lastPos[i][0] + this.offset[0],
        this.lastPos[i][1] + this.offset[1],
      ];

      if (painter.draw) {
        let curPos = [
          painter.curPos[0] + this.offset[0],
          painter.curPos[1] + this.offset[1],
        ];

        this.pathctx.strokeStyle = painter.colour;
        this.pathctx.beginPath();
        this.pathctx.moveTo(...lastPos);
        this.pathctx.lineTo(...curPos);
        this.pathctx.stroke();
      }

      this.lastPos[i] = painter.curPos;
    });
  }

  drawPath() {
    this.pathctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.lastPos = [];
    if (this.painters.length !== 0) {
      this.paths.forEach((controller, i) => {
        controller.forEach((path) => {
          if (path.length > 1) {
            let color = path.shift();
            this.pathctx.beginPath();
            this.pathctx.strokeStyle = color;
            path.forEach((pos, i) => {
              let curPos = [pos[0] + this.offset[0], pos[1] + this.offset[1]];
              if (i === 0) {
                this.pathctx.moveTo(...curPos);
              } else {
                this.pathctx.lineTo(...curPos);
              }
            });
            this.pathctx.stroke();
          }
        });
      });
    }
  }

  render() {
    return (
      <div className="flex flex-wrap w-screen h-screen overflow">
        <div id="canvasContainer"></div>
      </div>
    );
  }
}

export default Canvas;
