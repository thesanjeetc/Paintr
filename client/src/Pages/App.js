import React from "react";
import { withRouter } from "react-router-dom";
import Canvas from "./Canvas";
import MenuButton from "./Icons/menu.png";
import CloseButton from "./Icons/close.png";
import Icon from "./Icons/airScribeIcon.png";
import Airscribe from "./Icons/airscribeMain.png";
import VideoIcon from "./Icons/film.png";
import QRCode from "qrcode";

const VideoCall = (props) => {
  return (
    <iframe
      src={
        "https://tokbox.com/embed/embed/ot-embed.js?embedId=f1556e1b-053e-47f2-88a9-f6c4b344f9e7&room=" +
        props.roomID +
        "&iframe=true&abc=" +
        Math.random()
      }
      width="360px"
      height="200px"
      scrolling="no"
      frameBorder="0"
      marginHeight="0"
      marginWidth="0"
      allow="microphone; camera"
    ></iframe>
  );
};

class App extends React.Component {
  constructor(props) {
    super(props);

    if (props.roomID === undefined) {
      let newRoom = Math.random().toString(16).substr(2, 6);
      props.history.push("/canvas/" + newRoom);
    }

    let options = {
      color: { dark: "#2e2d2d", light: "#fff" },
      width: 300,
      height: 300,
    };

    let link =
      "https://" + window.location.hostname + "/controller/" + props.roomID;

    QRCode.toDataURL(link, options, (err, url) => {
      this.qr = url;
    });

    this.state = {
      menu: false,
      videocall: false,
    };
  }

  render() {
    return (
      <div className="flex flex-wrap w-screen h-screen overflow-hidden">
        <Canvas roomID={this.props.roomID} />
        <div className="bottom-0 absolute m-8">
          {this.state.videocall && <VideoCall roomID={this.props.roomID} />}
        </div>
        <div className="w-screen h-screen fixed z-50 flex bg-transparent overflow-hidden">
          <div className="text-white absolute p-12">
            <img src={Icon} className="w-16 menuButton" />
          </div>
          <div
            className={
              this.state.menu
                ? "h-full w-full md:w-1/2 lg:w-1/2 xl:w-1/3 z-40 absolute bg-white right-0 pl-12 pr-12 pt-8 menuOpen"
                : "h-full w-full md:w-1/2 lg:w-1/3 xl:w-1/3 absolute bg-white right-0 pl-12 pr-12 pt-8 menuClose"
            }
          >
            <div className="w-full">
              <img src={Airscribe} width="310" className="" />
            </div>
            <div className="w-full -mt-6">
              <img width="300" src={this.qr} className="m-auto" />
              <li className="ml-4 w-full m-auto font-semibold mt-4">
                Scan QR code to add multiple controllers.
              </li>
            </div>
            <div className="w-full ">
              <li className="ml-4 w-full m-auto font-semibold mt-4">
                Press CALIBRATE to center your pointer.
              </li>
            </div>
            <div className="w-full ">
              <li className="ml-4 w-full m-auto font-semibold mt-4">
                Share the room link with friends.
              </li>
              <div className="w-full pr-5 pl-5 mt-8">
                <p className="p-3 text-white text-center rounded-lg roomLink">
                  {window.location.hostname + "/canvas/" + this.props.roomID}
                </p>
              </div>
            </div>
          </div>
          <div className="m-auto absolute z-10 bottom-0 right-0 mb-32 mr-16 menuButton">
            <div
              className="bg-white p-5 rounded-full mr-2 mb-10"
              onClick={() =>
                this.setState({ videocall: !this.state.videocall })
              }
            >
              <img src={VideoIcon} className="w-6 m-auto" />
            </div>
          </div>
          <div className="m-auto absolute z-50 bottom-0 right-0 mb-16 mr-16 menuButton">
            <div
              className="bg-white p-6 rounded-full"
              onClick={() => this.setState({ menu: !this.state.menu })}
            >
              <img
                src={this.state.menu ? CloseButton : MenuButton}
                className="w-8 m-auto"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(App);
