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

    if (process.env.NODE_ENV !== "production") {
      this.socket.emit("draw", true);
    }

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
      <div className=" w-screen h-screen bg-gray-900 overflow text-white flex flex-wrap">
        <div className="w-full bg-gray-300 bar" id="bar"></div>
        <div
          className=" drawBtn bg-gray-900 w-full  noselect flex"
          onTouchStart={() => this.socket.emit("draw", true)}
          onTouchEnd={() => this.socket.emit("draw", false)}
        >
          <div className=" h-full w-full m-auto p-4">
            <div className="border-b-8 border-blue-600 hoverbtn m-auto noselect text-gray-500 flex bg-gray-800 shadow-2xl  w-full rounded-lg h-full">
              <p className="m-auto">DRAW</p>
            </div>
          </div>
        </div>
        <div className=" w-full noselect flex">
          <div
            className=" calBtn w-1/2 noselect flex p-4"
            onClick={() => this.socket.emit("calibrate")}
          >
            <div className="border-b-8 border-green-600 hoverbtn m-auto noselect flex bg-gray-800 text-gray-500  w-full h-full shadow-2xl rounded-lg">
              <p className="m-auto">CALIBRATE</p>
            </div>
          </div>
          <div
            className=" delBtn text-gray-500 w-1/2 noselect flex p-4"
            onClick={() => this.socket.emit("delete")}
          >
            <div className="border-b-8 border-red-600 hoverbtn m-auto noselect flex bg-gray-800 shadow-2xl  w-full h-full rounded-lg">
              <p className="m-auto">CLEAR</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Controller;
