import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import RainScene from "./RainScene";

type Environment = "clear" | "cloudy" | "rainy" | "snowy";
type Time = "morning" | "afternoon" | "evening" | "night";

function App() {
  const [environment, setEnvironment] = useState<Environment>("snowy");
  const [time, setTime] = useState<Time>("afternoon");

  // WebSocket URL
  const socketUrl = "wss://hex2025.fly.dev/ws";

  // Use the useWebSocket hook
  const { lastMessage, readyState } = useWebSocket(socketUrl);

  // State to store parsed data
  const [parsedData, setParsedData] = useState<any>(null);

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      console.log('Received message:', lastMessage.data);
      try {
        const parsed = JSON.parse(lastMessage.data);
        console.log(parsed);
        setParsedData(parsed);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninitiated',
  }[readyState] || 'Unknown';

  console.log('Connection Status:', connectionStatus);

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
      <p>Connection Status: {connectionStatus}</p>
      {lastMessage ? <p>Last message: {lastMessage.data}</p> : null}
    </div>
  );
}

export default App;