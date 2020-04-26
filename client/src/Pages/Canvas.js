import React from "react";
import io from "socket.io-client";

class CanvasBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    let roomID = props.roomID;
    let address = window.location.hostname + "/";
    this.socket = io.connect(address + roomID, {
      query: { room: roomID },
      reconnect: true,
    });

    this.socket.emit("canvas");

    var canvas = document.createElement("canvas");

    this.canvasWidth = window.innerWidth;
    this.canvasHeight = window.innerHeight;

    canvas.setAttribute("width", this.canvasWidth);
    canvas.setAttribute("height", this.canvasHeight);

    this.offset = [this.canvasWidth / 2, this.canvasHeight / 2];

    window.addEventListener("resize", () => {
      this.canvasWidth = window.innerWidth;
      this.canvasHeight = window.innerHeight;

      canvas.setAttribute("width", this.canvasWidth);
      canvas.setAttribute("height", this.canvasHeight);

      this.offset = [this.canvasWidth / 2, this.canvasHeight / 2];
    });

    canvas.setAttribute("id", "canvas");

    canvas.style.backgroundColor = "#000";

    this.painters = [];
    this.paths = [];

    this.canvas = canvas;
  }

  componentDidMount() {
    this.canvasBox = document.getElementById("canvasContainer");
    this.canvasBox.appendChild(this.canvas);

    var canvasLineJoin = "round";
    var canvasLineWidth = 10;

    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = canvasLineJoin;
    this.ctx.lineWidth = canvasLineWidth;

    setInterval(() => {
      this.socket.emit(
        "detect",
        this.canvas.toDataURL().split(";base64,").pop()
      );
    }, 2000);

    this.socket.on("detected", (text) => {
      this.props.detected(text);
    });

    this.socket.on("sync", (painters, paths) => {
      this.painters = painters;
      this.paths = paths;
    });

    this.draw();
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    if (Object.keys(this.painters).length !== 0) {
      this.paths.forEach((controller, i) => {
        this.ctx.strokeStyle = this.painters[i].colour;
        this.ctx.beginPath();
        controller.forEach((path) => {
          if (path.length !== 0) {
            path.forEach((pos, i) => {
              let curPos = [pos[0] + this.offset[0], pos[1] + this.offset[1]];
              if (i === 0) {
                this.ctx.moveTo(...curPos);
              } else {
                this.ctx.lineTo(...curPos);
              }
            });
            this.ctx.stroke();
          }
        });
      });

      this.painters.forEach((painter, i) => {
        let curPos = [
          this.painters[i].curPos[0] + this.offset[0],
          this.painters[i].curPos[1] + this.offset[1],
        ];

        this.ctx.beginPath();
        this.ctx.arc(...curPos, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = this.painters[i].colour;
        this.ctx.fill();
        this.ctx.closePath();
      });
    }
    requestAnimationFrame(() => this.draw());
  }

  render() {
    return (
      <div className="flex flex-wrap w-screen h-screen overflow">
        <div id="canvasContainer"></div>
      </div>
    );
  }
}

export default CanvasBoard;
