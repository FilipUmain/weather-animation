import React from "react";
import "./App.css";
import RainScene from "./RainScene";

function App() {
  return (
    <div className="App">
      <RainScene environment="snowy" time="afternoon" />
    </div>
  );
}

export default App;
