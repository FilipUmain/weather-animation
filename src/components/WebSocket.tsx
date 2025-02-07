import React from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

const WebSocketComponent = () => {
  // Define the WebSocket URL
  const socketUrl = 'https://2-hex2025.fly.dev';

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

  // Function to send a message
  // const handleClickSendMessage = () => {
  //   sendMessage('Hello, WebSocket!');
  // };

  // Determine the connection status
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
  }[readyState] || 'Unknown';

  return (
    <div>
      {/* <button onClick={handleClickSendMessage}>Send Message</button> */}
      <p>Connection Status: {connectionStatus}</p>
      {lastMessage ? <p>Last message: {lastMessage.data}</p> : null}
    </div>
  );
};

export default WebSocketComponent;