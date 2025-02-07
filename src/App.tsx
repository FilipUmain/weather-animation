import './App.css';

function App() {
  return (
    <div className="App">
      <svg className="snow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
        {[...Array(100)].map((_, i) => (
          <circle
            key={i}
            className="snowflake"
            cx={Math.random() * 800}
            cy={Math.random() * 600}
            r={Math.random() * 3 + 1}
            fill="white"
          />
        ))}
      </svg>
    </div>
  );
}

export default App;