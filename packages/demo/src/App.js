import logo from './logo.svg';
import './App.css';
import { useServerState } from 'use-server-state';

function App() {
  const [num, setNum] = useServerState(0)
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        Counter: {num}

        <button onClick={() => setNum(num + 1)}>Increment</button>
        <button onClick={() => setNum(0)}>Reset</button>

      </header>
    </div >
  );
}

export default App;
