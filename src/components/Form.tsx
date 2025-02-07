import React, { useState } from 'react';
import axios from '../../node_modules/axios/index';

const Form = () => {
  const [inputValue, setInputValue] = useState('');
  const [responseMessage, setResponseMessage] = useState(''); // State to store the response message

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prepare data to send to the backend
    const dataToSend = {
      prompt: inputValue,
    };

    try {
      // Send data to the backend using axios
      const response = await axios.post('http://localhost:3000/prompt', dataToSend);

      // Log the response from the backend
      console.log('Response from backend:', response.data);

      // Set the response message to display it
      setResponseMessage(response.data.message || 'Success!'); // Assuming the response has a 'message' field
    } catch (error) {
      console.error('Error sending data to backend:', error);
      setResponseMessage('Error sending data to backend');
    }

    // Reset the input field
    setInputValue('');
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <label htmlFor="promptInput">Enter your prompt:</label>
        <input
          type="text"
          id="promptInput"
          value={inputValue}
          onChange={handleInputChange}
          required
        />
        <button type="submit">Submit</button>
      </form>
      <span>{responseMessage}</span> {/* Display the response message */}
    </div>
  );
};

export default Form;