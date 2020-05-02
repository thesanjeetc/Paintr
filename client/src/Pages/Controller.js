import React from "react";
import io from "socket.io-client";
import "@simonwep/pickr/dist/themes/monolith.min.css";
import Pickr from "@simonwep/pickr";

class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    let roomID = props.roomID;

    let address =
      process.env.NODE_ENV === "production"
        ? "https://airscribe.herokuapp.com/"
        : window.location.hostname + "/";

    this.socket = io.connect(address + roomID, {
      query: { room: roomID },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    this.socket.emit("controller");

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

  componentDidMount() {
    const pickr = Pickr.create({
      el: "#bar",
      theme: "monolith", // or 'monolith', or 'nano'
      useAsButton: true,
      lockOpacity: true,
      swatches: null,
      autoReposition: true,
      comparison: false,

      components: {
        hue: true,
      },
    });

    pickr.on("change", (instance) => {
      let currColor = "#" + pickr.getColor().toHEXA().join("");
      document.querySelector("#bar").style.backgroundColor = currColor;
      this.socket.emit("colour", currColor);
    });

    // pickr.on("hide", (instance) => {
    //   let currColor = "#" + pickr.getColor().toHEXA().join("");
    //   this.socket.emit("colour", currColor);
    // });

    this.socket.on("colour", (colour) => {
      console.log(colour);
      pickr.setColor(colour);
      document.querySelector("#bar").style.backgroundColor = colour;
    });
  }

  render() {
    return (
      <div className=" w-screen h-screen overflow text-white flex flex-wrap">
        <div
          className=" drawBtn bg-black w-full  noselect flex"
          onTouchStart={() => this.socket.emit("draw", true)}
          onTouchEnd={() => this.socket.emit("draw", false)}
        >
          <div className="w-full h-8 bg-black absolute" id="bar">
            <p>CHANGE</p>
          </div>
          <div className="m-auto noselect flex">
            <p>PRESS TO DRAW</p>
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
