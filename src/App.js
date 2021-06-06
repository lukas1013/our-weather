import { useState, useEffect, useMemo, Fragment, useRef } from 'react';
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
  const changeLocationRef = useRef(null);
  const [isChangingLocation,setIsChangingLocation] = useState(false);

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

      <label htmlFor="address-ipt" id="change-location" onClick={() => setIsChangingLocation(!isChangingLocation)}>Change location</label>

      <input 
        ref={changeLocationRef} 
        onBlur={() => setIsChangingLocation(false)} 
        onKeyDown={e => { 
          const inputAddress = changeLocationRef.current.value
          if (e.code === "Enter" && inputAddress.match(/^[[a-z\sáàãâçéèẽêíìîóòôúù]+[,\s]?[a-z]{2}?/i)) { 
            console.log('Matched')
            geocodeApi.getGeocode(inputAddress.replace(/[\s,]/g, '+')).then(response => {
              const [ coords, address ] = response;
              console.log(address)
              return weatherApi.getLocalizationWeather(coords, lang).then(weWeather => {
                sessionStorage.setItem('address', `${address.city}, ${address.stateCode}`)
                setWeekWeather(weWeather)
                return address
              })
            }).then(address => {
              setLocalization(`${address.city}, ${address.stateCode || address.countryCode}`);
            })

            setIsChangingLocation(false)
          }
        }}
        style={{ display: isChangingLocation ? "initial" : "none" }} 
        placeholder="Albany, NY" name="address" id="address-ipt" />

      <footer className="App-footer">
        <a href="github.com/" id="github">
          Github
        </a>
      </footer>
    </div>

  );
}

export default App;
