import React from "react";
import io from "socket.io-client";

class Canvas extends React.Component {
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
    canvas.setAttribute("id", "canvas");

    canvas.style.backgroundColor = "#000";

    this.canvas = canvas;
  }

  componentDidMount() {
    this.canvasBox = document.getElementById("canvasContainer");
    this.canvasBox.appendChild(this.canvas);

    this.ctx = this.canvas.getContext("2d");
    this.ctx.lineJoin = "round";
    this.ctx.lineWidth = 10;
  }

  render() {
    return (
      <div className="w-screen h-screen overflow-hidden">
        <div id="canvasContainer"></div>
      </div>
    );
  }
}

export default Canvas;
