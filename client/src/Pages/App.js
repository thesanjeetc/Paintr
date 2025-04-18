import React from "react";
import { withRouter } from "react-router-dom";
import Canvas from "./Canvas";
import MenuButton from "./Icons/menu.png";
import CloseButton from "./Icons/close.png";
import Icon from "./Icons/paintrIcon.png";
import Paintr from "./Icons/paintrMain.png";
import InfoIcon from "./Icons/info.png";
import CoffeeIcon from "./Icons/coffee.png";
import TwitterIcon from "./Icons/twitter.png";
import QRCode from "qrcode";

class App extends React.Component {
  constructor(props) {
    super(props);

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

    if (props.roomID === undefined) {
      let newRoom = Math.random().toString(16).substr(2, 6);
      props.history.push("/canvas/" + newRoom);
      localStorage.removeItem("visited");
    }

    let options = {
      color: { dark: "#fff", light: "#00000000" },
      width: 300,
      height: 300,
    };

    let link =
      "https://" + window.location.hostname + "/control/" + props.roomID;

    QRCode.toDataURL(link, options, (err, url) => {
      this.qr = url;
    });
  }

  render() {
    if (this.props.roomID !== undefined) {
      return (
        <div className="flex flex-wrap w-screen h-screen overflow-hidden">
          <Canvas roomID={this.props.roomID} />

          <div className="w-screen h-screen fixed z-50 flex bg-transparent overflow-hidden">
            <div className="text-white absolute sm:p-12 ">
              <div className="imgCont">
                <img src={Paintr} className="h-32 menuButton ml-6 mt-2" />
              </div>
            </div>
            <div className="text-white z-20  absolute rounded-lg right-0 sm:mt-20 mt-12  mr-12 sm:mr-24 flex">
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
              <div className="max-w-4xl min-w-xl w-full md:w-3/4 lg:w-4/5 xl:w-4/5 bg-transparent z-10 pr-8 pl-8 md:pt-32 pb-8 pt-32  text-white text-base m-auto h-full ">
                <div className="overflow-y-auto w-full h-full scroller p-3">
                  <img width="250" src={this.qr} className="m-auto -mt-2" />
                  <ul className="list-disc list-outside">
                    <li className="mt-4 ml-2">
                      Scan QR code to add mobile controllers. Multiple
                      controllers are supported for multi-player collaboration.
                    </li>
                    <li className="mt-4 ml-2">
                      Press CALIBRATE on your mobile controller to center your
                      pointer. Click the top COLOUR bar to change brush colour.
                    </li>
                    <li className="mt-4 ml-2">
                      Share the room link with others, for more fun.
                    </li>
                    <li className="mt-4 ml-2">
                      NOTE: As the Generic Sensor API is relatively new, iOS is
                      not currently{" "}
                      <a
                        className="pointer underline"
                        href="https://developer.mozilla.org/en-US/docs/Web/API/AbsoluteOrientationSensor#Browser_compatibility"
                      >
                        supported
                      </a>
                      .
                    </li>
                  </ul>
                  <div className="flex flex-wrap">
                    <p className="border-b-8 border-red-700 mt-6 pb-3 pt-3 pl-8 pr-8 rounded-lg text-black bg-white text-center m-auto">
                      <span className="text-red-700 mr-4">Room: </span>
                      {window.location.hostname +
                        "/canvas/" +
                        this.props.roomID}
                    </p>
                    <p className="border-b-8 border-blue-700 pt-3 mt-6 pb-3 pl-4 pr-4 rounded-lg text-black bg-white text-center m-auto">
                      <span className="text-blue-700 mr-4">Controller: </span>

                      {window.location.hostname +
                        "/control/" +
                        this.props.roomID}
                    </p>
                  </div>
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
              <div className="max-w-3xl min-w-xl w-full md:w-3/4 lg:w-3/5 xl:w-1/2 bg-transparent z-10 pr-8 pl-8 md:pt-24 pt-24 pb-8 text-white text-base m-auto h-full ">
                <div className="overflow-y-auto w-full h-full scroller p-3">
                  <img width="400" src={Paintr} className="m-auto -mt-2" />
                  <p className="mt-4">Hello there! 👋</p>
                  <p className="mt-4">
                    Paintr is a digital canvas on which everyone can paint on,
                    with their phone. That's right - with a built in inertial
                    measurement unit in almost every phone, Paintr brings
                    control and flexibility back to your hands. Here's a&nbsp;<a href="https://www.youtube.com/watch?v=s62hUhh05_c" className="underline">demo</a>.
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
            <div className="m-auto block absolute z-10 bottom-0 right-0 mr-4 md:mb-20 md:mr-20 menuButton ">
              <a href="https://www.twitter.com/thesanjeetc">
                <div className="rounded-full p-4 mr-2 mb-32 md:mb-12 twitterButton">
                  <img src={TwitterIcon} width="30" className="m-auto" />
                </div>
              </a>
            </div>
            <div className="m-auto block absolute z-10 bottom-0 right-0 mr-4 md:mb-8 md:mr-20 menuButton ">
              <a href="https://www.buymeacoffee.com/thesanjeetc">
                <div className="rounded-full p-2 mr-2 mb-10 md:mb-4 coffeeButton">
                  <img src={CoffeeIcon} className=" w-12 m-auto" />
                </div>
              </a>
            </div>
          </div>
          <div className="bottom-0 absolute mb-12 ml-20 hidden sm:block z-50">
            <a
              href="https://www.producthunt.com/posts/paintr-2?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-paintr-2"
              target="_blank"
            >
              <img
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=199172&theme=dark"
                alt="Paintr - Painting with your smartphone. | Product Hunt Embed"
                style={{ width: "210px", height: "54px" }}
                width="210px"
                height="54px"
              />
            </a>
          </div>
        </div>
      );
    } else {
      return <div className="w-screen h-screen bg-black"></div>;
    }
  }
}

export default withRouter(App);
