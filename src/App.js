import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 id="title">Our Weather</h1>
      </header>

      <h2 id="local-and-time">
        *localization* - <time>*time*</time>
      </h2>

      <main className="App-content">
        *weather icon*

        <span id="degrees">
          70 °C | 8001 °F
        </span>

        <span id="desc">
          Hail
        </span>

        <span id="humidity">
          50%
        </span>

        <span id="wind">
          10 Km/h
        </span>
      </main>
      
      <article id="week">
        <div id="week-content">
          
        </div>
      </article>

      <label htmlFor="address-ipt" id="change-location">Change location</label>

      <input id="address-ipt" placeholder="Albany, NY" name="address"/>

      <footer className="App-footer">
        <a href="github.com/" id="github">
          Github
        </a>
      </footer>
    </div>

  );
}

export default App;
