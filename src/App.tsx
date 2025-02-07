import React from "react";
import "./App.css";
import RainScene from "./RainScene";

function App() {
  return (
    <div className="App">
      <RainScene environment="snowy" time="night" />
    </div>
  );
}

export default App;
