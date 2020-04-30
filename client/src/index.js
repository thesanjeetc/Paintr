import React from "react";
import ReactDOM from "react-dom";
import "./Styles/index.css";
import "./Styles/tailwind.css";
import * as serviceWorker from "./serviceWorker";
import { Route, BrowserRouter as Router } from "react-router-dom";
import App from "./Pages/App";
import Controller from "./Pages/Controller";

const routing = (
  <Router>
    <div>
      <Route path="/" exact component={App} />
      <Route path="/canvas" exact component={App} />
      <Route
        path="/canvas/:id"
        component={(props) => <App roomID={props.match.params.id} />}
      />
      <Route
        path="/controller/:id"
        component={(props) => <Controller roomID={props.match.params.id} />}
      />
    </div>
  </Router>
);

ReactDOM.render(routing, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
