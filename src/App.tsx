import React, { useState } from "react";
import "./App.css";
import RainScene from "./RainScene";
import WebSocketComponent from "./components/WebSocket";

type Environment = "clear" | "cloudy" | "rainy" | "snowy";
type Time = "morning" | "afternoon" | "evening" | "night";

function App() {
  const [environment, setEnvironment] = useState<Environment>("snowy");
  const [time, setTime] = useState<Time>("afternoon");

  console.log(environment, time);
  return (
    <div className="App">
      <div className="controls">
        <div>
          <h3>Weather</h3>
          {(["clear", "cloudy", "rainy", "snowy"] as Environment[]).map(
            (env) => (
              <button key={env} onClick={() => setEnvironment(env)}>
                {env}
              </button>
            )
          )}
        </div>
        <div>
          <h3>Time</h3>
          {(["morning", "afternoon", "evening", "night"] as Time[]).map((t) => (
            <button key={t} onClick={() => setTime(t)}>
              {t}
            </button>
          ))}
        </div>
      </div>
      <RainScene environment={environment} time={time} />
      <WebSocketComponent />
    </div>
  );
}

export default App;
