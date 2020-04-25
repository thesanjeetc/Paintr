import React from "react";
import Canvas from "./Canvas";

class App extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Canvas />
      </div>
    );
  }
}

export default App;
