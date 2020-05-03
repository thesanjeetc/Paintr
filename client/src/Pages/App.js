import React from "react";
import { withRouter } from "react-router-dom";
import Canvas from "./Canvas";
import MenuButton from "./Icons/menu.png";
import CloseButton from "./Icons/close.png";
import Icon from "./Icons/paintrIcon.png";
import Paintr from "./Icons/paintrMain.png";
import InfoIcon from "./Icons/info.png";
import CoffeeIcon from "./Icons/coffee.png";
import QRCode from "qrcode";

class App extends React.Component {
  constructor(props) {
    super(props);

    if (props.roomID === undefined) {
      let newRoom = Math.random().toString(16).substr(2, 6);
      props.history.push("/canvas/" + newRoom);
    }

    let options = {
      color: { dark: "#fff", light: "#00000000" },
      width: 300,
      height: 300,
    };

    let link =
      "https://" + window.location.hostname + "/controller/" + props.roomID;

    QRCode.toDataURL(link, options, (err, url) => {
      this.qr = url;
    });

    if (localStorage.getItem("visited") === null) {
      localStorage.setItem("visited", "1");
      this.state = {
        menu: false,
        about: true,
      };
    } else if (localStorage.getItem("visited") === "1") {
      localStorage.setItem("visited", "2");
      this.state = {
        menu: true,
        about: false,
      };
    } else {
      this.state = {
        menu: false,
        about: false,
      };
    }
  }

  render() {
    if (this.props.roomID !== undefined) {
      return (
        <div className="flex flex-wrap w-screen h-screen overflow-hidden">
          <Canvas roomID={this.props.roomID} />
          <div className="w-screen h-screen fixed z-50 flex bg-transparent overflow-hidden">
            <div className="text-white absolute p-12 ">
              <div className="imgCont">
                <img src={Paintr} className="h-24 menuButton" />
              </div>
            </div>
            <div className="text-white z-20 sm:hidden absolute rounded-lg right-0 mt-16 mr-20 flex">
              <p
                className=" cursor-pointer pl-4 pt-2 pb-2 menuButton no-select mr-4"
                onClick={() =>
                  this.setState({ about: !this.state.about, menu: false })
                }
              >
                About
              </p>
              <p
                className=" cursor-pointer pl-4 pt-2 pb-2 menuButton no-select"
                onClick={() =>
                  this.setState({ menu: !this.state.menu, about: false })
                }
              >
                Menu
              </p>
            </div>
            {this.state.menu && (
              <div className="max-w-3xl min-w-xl w-full md:w-3/4 lg:w-1/2 bg-transparent z-10 pr-8 pl-8 md:pt-32 pb-8 pt-32  text-white text-base m-auto h-full ">
                <div className="overflow-y-auto w-full h-full scroller p-3">
                  {/* <p className="mt-4">Hello there! 👋</p> */}
                  <img width="250" src={this.qr} className="m-auto -mt-2" />
                  <ul className="list-disc list-outside">
                    <li className="mt-4 ml-2">
                      Scan QR code to add mobile controllers. Multiple
                      controllers are supported for multi-player collaboration.
                    </li>
                    <li className="mt-4 ml-2">
                      Press CALIBRATE on your mobile controller to center your
                      pointer. Click the colour bar to change brush colour.
                    </li>
                    <li className="mt-4 ml-2">
                      Share the room link with friends.
                    </li>
                  </ul>
                  <p className="p-3 rounded-lg text-white bg-teal-900  mt-6 text-center m-auto">
                    {window.location.hostname + "/canvas/" + this.props.roomID}
                  </p>
                  <p
                    className="mt-4 underline cursor-pointer w-16"
                    onClick={() => this.setState({ menu: !this.state.menu })}
                  >
                    Close
                  </p>
                </div>
              </div>
            )}
            {this.state.about && (
              <div className="max-w-3xl min-w-xl w-full md:w-3/4 lg:w-1/2 bg-transparent z-10 pr-8 pl-8 md:pt-24 pt-24 pb-8 text-white text-base m-auto h-full ">
                <div className="overflow-y-auto w-full h-full scroller p-3">
                  <img width="300" src={Paintr} className="m-auto -mt-2" />
                  <p className="mt-4">Hello there! 👋</p>
                  <p className="mt-4">
                    Paintr is a digital canvas on which everyone can paint on,
                    with their phone. That's right - with a built in inertial
                    measurement unit in almost every phone, Paintr brings
                    control and flexibility back to your hands.
                  </p>
                  <p className="mt-4">
                    I created this as an experiment to explore a more intuitive
                    interaction with the digital world, with something we all
                    carry around in our pockets.
                  </p>
                  <p className="mt-4">
                    Try it out now. Press the menu button. Scan the QR code. And
                    you're in! Paintr supports multiple controllers and screens
                    so share the room link with friends. Or perhaps cast the tab
                    to the big screen. It's quite flexible and really cool.
                  </p>
                  <p className="mt-4">
                    By the way, I'm Sanjeet. I am an 18 year old student with a
                    passion for technology and design. I have&nbsp;
                    <a
                      href="https://medium.com/@thesanjeetc"
                      className="underline"
                    >
                      a blog
                    </a>{" "}
                    . I'm also on{" "}
                    <a
                      href="https://twitter.com/thesanjeetc"
                      className="underline"
                    >
                      Twitter
                    </a>
                    .
                  </p>
                  <p className="mt-4">
                    {" "}
                    If you like Paintr, why not{" "}
                    <a
                      href="https://www.buymeacoffee.com/thesanjeetc"
                      className="underline"
                    >
                      buy me a coffee
                    </a>
                    ?
                  </p>
                  <p
                    className="mt-4 underline cursor-pointer w-16"
                    onClick={() => this.setState({ about: !this.state.about })}
                  >
                    Close
                  </p>
                </div>
              </div>
            )}
            {this.state.text && (
              <div className="w-full bottom-0 pb-12 mb-5 opacity-75 absolute">
                <div className="m-auto flex-wrap  bg-white text-black max-w-xs h-12 menuButton rounded-lg">
                  <p className="m-auto text-center  pt-3">{this.state.text}</p>
                </div>
              </div>
            )}
            <div className="m-auto sm:block hidden absolute z-10 bottom-0 right-0 mb-56 mr-16 menuButton ">
              <a href="https://www.buymeacoffee.com/thesanjeetc">
                <div className="rounded-full p-2 mr-2 mb-10 md:mb-8 coffeeButton">
                  <img src={CoffeeIcon} className=" w-12 m-auto" />
                </div>
              </a>
            </div>
            <div className="m-auto sm:block hidden absolute z-10 bottom-0 right-0 mb-32 mr-16 menuButton">
              <div
                className="bg-white p-5 rounded-full mr-2 mb-10"
                onClick={() =>
                  this.setState({ about: !this.state.about, menu: false })
                }
              >
                <img
                  src={this.state.about ? CloseButton : InfoIcon}
                  className="w-6 m-auto"
                />
              </div>
            </div>
            <div className="m-auto sm:block hidden absolute z-50 bottom-0 right-0 mb-16 mr-16 menuButton">
              <div
                className="bg-white p-6 rounded-full"
                onClick={() =>
                  this.setState({ menu: !this.state.menu, about: false })
                }
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
    } else {
      return <div className="w-screen h-screen bg-black"></div>;
    }
  }
}

export default withRouter(App);
