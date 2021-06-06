import { useState, useEffect, useMemo, Fragment } from 'react';
import * as geocodeApi from './services/geocode';
import * as weatherApi from './services/weather';
import WeatherIcon from './components/WeatherIcon/';
import './App.css';

function App() {
  const [localization, setLocalization] = useState(sessionStorage.getItem('address'));
  const [time, setTime] = useState(new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date()));
  const days = useMemo(() => ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'],[]);
  const [today, setToday] = useState(days[new Date().getDay()]);
  const lang = useMemo(() => {
    const navLang = navigator.language

    //formating for the API
    return navLang.slice(0,2) + '_' + navLang.slice(-2).toUpperCase()
  }, []);
  const week = useMemo(() => {
    const w = []

    if (today === 'Saturday') {
      w.push(...days)
    } else {
      w.push(...(days.splice(days.indexOf(today)+1).concat(days)))
    }

    return w
  }, [today, days]);
  const [weekWeather, setWeekWeather] = useState([{}]);

  useEffect(() => {
    if ('geolocation' in navigator && !sessionStorage.getItem('address')) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        geocodeApi.getReverseGeocode(coords).then(address => 
          setLocalization(address)).catch(err =>
            console.log(err.message))
      })
    } 
  }, [])

  useEffect(() => {
    const latitude = sessionStorage.getItem('lat'), longitude = sessionStorage.getItem('long');
    weatherApi.getWeekWeather({latitude,longitude}, lang).then(weWeather => {
      setWeekWeather(weWeather)
    }).catch(e => console.log(e))
  }, [lang])

  return (
    <div className="App">
      <header className="App-header">
        <h1 id="title">Our Weather</h1>
      </header>

      <h2 id="local-and-time">
        {localization} - <time>{time}</time>
      </h2>

      <main className="App-content">
        <WeatherIcon id="weather" icon={weekWeather[0].icon} iconId={weekWeather[0].iconId} />

        <span id="degrees">
          {weekWeather[0].temp}
        </span>

        <span id="desc">
          {weekWeather[0].desc}
        </span>

        <span id="humidity">
          Humidity: {weekWeather[0].humidity}
        </span>

        <span id="wind">
          Wind: {weekWeather[0].wind}
        </span>
      </main>
      
      <article id="week">
        <div id="week-content">
          { 
            weekWeather.slice(1).map((item, key) => (
              <Fragment key={key}>
                <span className="day">{week[key]}</span>
                <figure className="weather-container">
                  <WeatherIcon className="weather" title={item.desc} icon={item.icon} iconId={item.iconId} />
                </figure>
                <span className="degrees">{item.temp ?? ''}</span>
              </Fragment>
            )) 
          }
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
