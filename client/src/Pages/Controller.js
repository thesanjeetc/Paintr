import React from "react";
import io from "socket.io-client";
import "@simonwep/pickr/dist/themes/monolith.min.css";
import Pickr from "@simonwep/pickr";

class Controller extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: false,
    };

    let roomID = props.roomID;

    let address =
      process.env.NODE_ENV === "production"
        ? "https://airscribe.herokuapp.com/"
        : window.location.hostname + "/";

    try {
      /* eslint-disable no-undef */
      const sensor = new AbsoluteOrientationSensor({
        frequency: 18,
      });
      sensor.addEventListener("error", (event) => {
        this.socket.disconnect();

        if (event.error.name === "NotAllowedError") {
          this.setState({ error: "Permission to access sensor was denied." });
        } else if (event.error.name === "NotReadableError") {
          this.setState({ error: "Cannot connect to the sensor." });
        }
      });

      sensor.addEventListener("reading", (e) => this.readSensor(e));
      sensor.start();

      this.socket = io.connect(address + roomID, {
        query: { room: roomID },
        // reconnection: true,
        // reconnectionDelay: 1000,
        // reconnectionDelayMax: 5000,
        // reconnectionAttempts: Infinity,
      });

      this.socket.emit("controller");

      if (process.env.NODE_ENV !== "production") {
        let x = true;
        setInterval(() => {
          this.socket.emit("draw", x);
          x = !x;
          console.log("DRAW: " + !x);
        }, 3000);
      }

      /* eslint-enable no-undef */
    } catch (error) {
      if (error.name === "SecurityError") {
        this.setState({
          error: "Sensor construction was blocked by the Feature Policy.",
        });
      } else if (error.name === "ReferenceError") {
        this.setState({ error: "Sensor is not supported by the User Agent." });
      } else {
        throw error;
      }
    }
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
      if (!this.state.error) {
        let currColor = "#" + pickr.getColor().toHEXA().join("");
        document.querySelector("#bar").style.backgroundColor = currColor;
      }
    });

    pickr.on("changestop", (instance) => {
      if (!this.state.error) {
        let currColor = "#" + pickr.getColor().toHEXA().join("");
        this.socket.emit("colour", currColor);
      }
    });

    try {
      this.socket.on("colour", (colour) => {
        pickr.setColor(colour);
        document.querySelector("#bar").style.backgroundColor = colour;
      });
    } catch {}
  }

  render() {
    if (this.state.error) {
      return (
        <div className="text-white flex w-screen h-screen">
          <p className="m-auto text-2xl p-4 bg-red-800 rounded-lg">
            {this.state.error}
          </p>
        </div>
      );
    } else {
      return (
        <div className=" w-screen h-screen bg-black overflow text-white flex flex-wrap">
          <div className="w-full bg-gray-300 bar" id="bar"></div>
          <div
            className=" drawBtn bg-black w-full  noselect flex"
            onTouchStart={() => this.socket.emit("draw", true)}
            onTouchEnd={() => this.socket.emit("draw", false)}
          >
            <div className=" h-full w-full m-auto p-4">
              <div className="border-b-8 border-blue-600 hoverbtn m-auto noselect text-gray-500 flex bg-gray-900 shadow-2xl  w-full rounded-lg h-full">
                <p className="m-auto">DRAW</p>
              </div>
            </div>
          </div>
          <div className=" w-full noselect flex">
            <div
              className=" calBtn w-1/2 noselect flex p-4"
              onClick={() => this.socket.emit("calibrate")}
            >
              <div className="border-b-8 border-green-600 hoverbtn m-auto noselect flex bg-gray-900 text-gray-500  w-full h-full shadow-2xl rounded-lg">
                <p className="m-auto">CALIBRATE</p>
              </div>
            </div>
            <div
              className=" delBtn text-gray-500 w-1/2 noselect flex p-4"
              onClick={() => this.socket.emit("delete")}
            >
              <div className="border-b-8 border-red-600 hoverbtn m-auto noselect flex bg-gray-900 shadow-2xl  w-full h-full rounded-lg">
                <p className="m-auto">CLEAR</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}

export default Controller;
