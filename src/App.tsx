import React, { useState, useEffect } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import "./App.css";
import RainScene from "./RainScene";

type Environment = "clear" | "cloudy" | "rainy" | "snowy";
type Time = "morning" | "afternoon" | "evening" | "night";

interface CameraPosition {
  x: number;
  y: number;
  z: number;
}

interface CameraRotation {
  x: number;
  y: number;
  z: number;
}

 export interface SceneSettings {
  fogDensity: number;
  cameraPosition: CameraPosition;
  cameraRotation: CameraRotation;
  ambientLightIntensity: number;
  directionalLightIntensity: number;
  flashColor: number;
  flashIntensity: number;
  flashDistance: number;
  flashDecay: number;
  rainCount: number;
  rainColor: number;
  rainSize: number;
  cloudOpacity: number;
  cloudCount: number;
  skyColor: number;
  cloudColor: number;
}

function App() {
  const [environment, setEnvironment] = useState<Environment>();
  const [time, setTime] = useState<Time>();

  // WebSocket URL
  const socketUrl = "wss://hex2025.fly.dev/ws";

  // Use the useWebSocket hook
  const { lastMessage, readyState } = useWebSocket(socketUrl);

  // State to store parsed data
  const [parsedData, setParsedData] = useState<SceneSettings>({
    fogDensity: 0.0015,
    cameraPosition: { x: 1, y: -10, z: 1 },
    cameraRotation: { x: 1.16, y: -0.12, z: 0.27 },
    ambientLightIntensity: time === "morning" ? 0.02 : 0.1,
    directionalLightIntensity: time === "morning" ? 20 : time === "evening" ? 30 : 50,
    flashColor: 0x062d89,
    flashIntensity: 30,
    flashDistance: 10,
    flashDecay: 1.7,
    rainCount: environment === "rainy" ? 10000 : 0,
    rainColor: 0xaaaaaa,
    rainSize: environment === "snowy" ? 1 : 0.1,
    cloudOpacity: environment === "clear" ? 0.3 : 1,
    cloudCount: environment === "cloudy" ? 30 : 25,
    skyColor: 0xffffff,
    cloudColor: 0xffffff,
  });

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage !== null) {
      // console.log('Received message:', lastMessage.data);
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

  // console.log('Connection Status:', connectionStatus);

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
      <RainScene environment={environment} time={time} data={parsedData}/>
      <p>Connection Status: {connectionStatus}</p>
      {lastMessage ? <p>Last message: {lastMessage.data}</p> : null}
    </div>
  );
}

export default App;