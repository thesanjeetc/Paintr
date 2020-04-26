import React from "react";
import io from "socket.io-client";

class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    let roomID = props.roomID;
    let address = window.location.hostname + "/";
    this.socket = io.connect(address + roomID, {
      query: { room: roomID },
      reconnect: true,
    });

    this.socket.emit("controller");

    this.socket.on("colour", (colour) => {
      console.log(colour);
      document.querySelector("#bar").style.backgroundColor = colour;
    });

    /* eslint-disable no-undef */
    const sensor = new AbsoluteOrientationSensor({
      frequency: 50,
    });

    sensor.addEventListener("reading", (e) => this.readSensor(e));
    sensor.start();
    /* eslint-enable no-undef */
  }

  readSensor(e) {
    let q = e.target.quaternion;
    this.socket.emit("orientation", q);
  }

  render() {
    return (
      <div className=" w-screen h-screen overflow text-white flex flex-wrap">
        <div
          className=" drawBtn bg-black w-full  noselect flex"
          onTouchStart={() => this.socket.emit("draw", true)}
          onTouchEnd={() => this.socket.emit("draw", false)}
        >
          <div className="w-full h-8 bg-black absolute" id="bar"></div>
          <div className="m-auto noselect flex">
            <p>DRAW</p>
          </div>
        </div>
        <div className=" w-full noselect flex">
          <div
            className=" calBtn w-1/2 noselect flex"
            onClick={() => this.socket.emit("calibrate")}
          >
            <div className="m-auto noselect">
              <p>CALIBRATE</p>
            </div>
          </div>
          <div
            className=" delBtn w-1/2 noselect flex"
            onClick={() => this.socket.emit("delete")}
          >
            <div className="m-auto noselect ">
              <p>CLEAR</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Controller;
