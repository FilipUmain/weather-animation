import React from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const WebSocketComponent = () => {
  // Define the WebSocket URL
  const socketUrl = 'wss://hex2025.fly.dev/ws';

  // Use the useWebSocket hook
  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl);

  // Log the readyState to debug
  console.log('Current readyState:', readyState);

  // Handle incoming messages
  React.useEffect(() => {
    if (lastMessage !== null) {
      console.log('Received message:', lastMessage.data);
    }
  }, [lastMessage]);

  // Determine the connection status
  const connectionStatus = {
    [WebSocket.CONNECTING]: 'Connecting',
    [WebSocket.OPEN]: 'Open',
    [WebSocket.CLOSING]: 'Closing',
    [WebSocket.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]:  'Uninitiated',
  }


  React.useEffect(() => {
    if (lastMessage !== null) {
      console.log('Received message:', lastMessage.data);
      const parsed = JSON.parse(lastMessage.data);
      console.log(parsed)
    }
  }, [lastMessage]);

  return (
    <div>
      {lastMessage ? <p>Last message: {lastMessage.data}</p> : null}
    </div>
  );
};

export default WebSocketComponent;