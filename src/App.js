import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ISO6391 from 'iso-639-1';
import * as geocodeApi from './services/geocode';
import * as weatherApi from './services/weather';
import WeatherIcon from './components/WeatherIcon/';
import './App.css';

function App() {
  const [localization, setLocalization] = useState(sessionStorage.getItem('address'));
  const [coordinates, setCoordinates] = useState(JSON.parse(sessionStorage.getItem('coords')));
  const timezone = useMemo(() => sessionStorage.getItem('timeZone'), []);
  const [time, setTime] = useState(new Intl.DateTimeFormat(sessionStorage.getItem('lang') || navigator.language, timezone ? { hour: '2-digit', minute: '2-digit', timeZone: timezone } : { hour: '2-digit', minute: '2-digit'}).format(new Date()));
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
      w.push(...([...days].splice(days.indexOf(today)+1).concat(days)))
    }

    return w
  }, [today, days]);
  const [weekWeather, setWeekWeather] = useState(JSON.parse(sessionStorage.getItem('weather')) || [{}]);
  const changeLocationRef = useRef(null);
  const [isChangingLocation,setIsChangingLocation] = useState(false);
  const clock = useCallback(() => {
    return setInterval(() => {
      const locale = sessionStorage.getItem('lang'), timeZone = sessionStorage.getItem('timeZone');
      const options = { hour: '2-digit', minute: '2-digit' }
      
      if (timeZone) {
        options.timeZone = timeZone
      }

      setTime(new Intl.DateTimeFormat(locale || navigator.language, options).format(new Date()))
    }, 1000);
  }, []);
  const setBrowserLocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        const { latitude, longitude } = coords
        sessionStorage.setItem('coords', JSON.stringify(coords))
        setCoordinates(coords)
        try {
          const address = await geocodeApi.getReverseGeocode({ latitude, longitude });
          sessionStorage.setItem('address', address);
          setLocalization(address);
        } catch (err) {
          return console.log(err.message);
        }
      }, err => console.log(err.message), { enableHighAccuracy: true })
    }
  }, []);
  const changeLocation = useCallback(e => {
      const inputAddress = changeLocationRef.current.value
      
      if (e.key === "Enter" && inputAddress.match(/^[[a-z\sáàãâçéèẽêíìîóòôúù]+[,\s]?[a-z]{2}?/i)) { 
        geocodeApi.getGeocode(inputAddress.replace(/[\s,]/g, '+')).then(response => {
          const [ coords, address ] = response;
          return weatherApi.getLocalizationWeather(coords, lang).then(weWeather => {
            sessionStorage.setItem('address', `${address.city}, ${address.stateCode || address.countryCode}`)
            sessionStorage.setItem('coords', JSON.stringify(coords))
            sessionStorage.setItem('lang', ISO6391.getCode(address.city || address.state))
            sessionStorage.setItem('timeZone', weWeather[0].timeZone);
            sessionStorage.setItem('weather', JSON.stringify(weWeather));
            setWeekWeather(weWeather)
            return address
          })
        }).then(address => {
          setLocalization(`${address.city}, ${address.stateCode || address.countryCode}`);
        })

        setIsChangingLocation(false)
      }
  }, [lang]);
  const getWeekWeather = useCallback(async () => {
    return await weatherApi.getWeekWeather(coordinates, lang).then(weWeather => {
      sessionStorage.setItem('weather', JSON.stringify(weWeather))
      return weWeather
    }).catch(e => console.log(e))
  },[coordinates, lang]);

  useEffect(() => {
    if (!localization) {
      return setBrowserLocation()
    }
  }, [localization, setBrowserLocation])

  useEffect(() => {
    if (!weekWeather[0].temp) {
      return getWeekWeather().then(weWeather => setWeekWeather(weWeather))
    }
  }, [weekWeather,getWeekWeather])

  useEffect(() => {
    clock()
  }, [clock])

  useEffect(() => {
    if (time === '00:00') {
      setToday(days[days.indexOf(today) + 1])
    }
  }, [time, days, today])

  useEffect(() => {
    if (isChangingLocation) {
      changeLocationRef.current.focus()
    }
  }, [isChangingLocation, changeLocationRef])

  return (
    <div className="App">
      <header className="App-header">
        <h1 id="title">Our Weather</h1>
      </header>

      <main className="App-content">

        <h2 id="local-and-time">
          {localization} - <time>{time}</time>
        </h2>
        
        {weekWeather[0].icon &&  <WeatherIcon id="weather" icon={weekWeather[0].icon} iconId={weekWeather[0].iconId} />}

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
        <table id="week-content">
          <caption>7 day weather</caption>
          <thead>
          <tr>
          {
            weekWeather.slice(1).map((item, key) => {
              const index = key === 0 ? 1 : 5 + (key - 1) * 4;
              
              return (
                <th key={key} className="day" tabIndex={index} scope="col">{week[key].slice(0,3)}<span className="long">{week[key].slice(3)}</span></th>
              )
            })
            }
          </tr>
          </thead>
          <tbody>
          <tr className="weather-row">
          {
            weekWeather.slice(1).map((item, key) => {
              const index = key === 0 ? 2 : 5 + (key - 1) * 4 + 1
              return (
                <td key={key} className="weather-container">
                  {item.icon && <WeatherIcon tabIndex={index} className="weather" title={item.title} aria-labelledby={'desc' + (key + 1)} icon={item.icon} iconId={item.iconId} /> } 
                </td>
              )
            })
          }
          </tr>
          <tr>
          {
            weekWeather.slice(1).map((item, key) => {
              const index = key === 0 ? 3 : 5 + (key - 1) * 4 + 1
              return (
                <td key={key} tabIndex={index} className="degrees">{item.temp ?? ''}</td>
              )
            })
          }
          </tr>
          <tr>
          {
            weekWeather.slice(1).map((item, key) => {
              const index = key === 0 ? 4 : 5 + (key - 1) * 4 + 1
              return (
                <td key={key} id={'desc' + (key + 1)} tabIndex={index} className="desc">{item.desc}</td>
              )
            })
          }
          </tr>
          </tbody>
        </table>
      </article>

      <button id="change-location" onClick={() => setIsChangingLocation(!isChangingLocation)}>Change location</button>

      <input 
        ref={changeLocationRef} 
        onBlur={() => setIsChangingLocation(false)} 
        onKeyDown={e => changeLocation(e)}
        style={{ display: isChangingLocation ? "initial" : "none" }} 
        placeholder="Albany, NY" name="address" id="address-ipt" />

      <span id="icon-author" title="Freepik">
        Icons made by&nbsp;
        <a href="https://www.freepik.com" title="Freepik" target="_blank" rel="noopener noreferrer">
          Freepik&nbsp;
        </a> 
        from&nbsp;
        <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer" title="Flaticon">
          www.flaticon.com
        </a>
      </span>

      <footer className="App-footer">
        <a href="https://github.com/lukas1013/our-weather" target="_blank" rel="noopener noreferrer" id="github">
          Github
        </a>
      </footer>
    </div>

  );
}

export default App;
