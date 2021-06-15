import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import ISO6391 from 'iso-639-1';
import * as geocodeApi from './services/geocode';
import * as weatherApi from './services/weather';
import WeekWeather from './components/WeekWeather';
import WeatherIcon from './components/WeatherIcon';
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
  const [isGeolocationDenied,setIsGeolocationDenied] = useState(0);
  const [canShowContent, setCanShowContent] = useState(isGeolocationDenied === 2 || (localization || weekWeather[0].temp));
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
      }, err => console.log(err.message), { enableHighAccuracy: true, timeout: 1000 * 5, maximumAge: 0 })
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
    if (coordinates?.latitude) {
      return await weatherApi.getWeekWeather(coordinates, lang).then(weWeather => {
        sessionStorage.setItem('weather', JSON.stringify(weWeather))
        return weWeather
      }).catch(e => console.log(e))
    } 

    return [{}]
  },[coordinates, lang]);

  useEffect(() => {
    if (!localization) {
      return setBrowserLocation()
    }
  }, [localization, setBrowserLocation])

  useEffect(() => {
    if (coordinates && !weekWeather[0].temp) {
      return getWeekWeather().then(weWeather => setWeekWeather(weWeather))
    }
  }, [coordinates ,weekWeather,getWeekWeather])

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

  useEffect(() => {
    navigator.permissions.query({ name: 'geolocation' }).then(permission => {
      if (permission.state === 'granted') {
        return setIsGeolocationDenied(2)
      } else if (permission.state === 'prompt') {
        return setIsGeolocationDenied(1)
      }

      setIsGeolocationDenied(0)
    })
      
  },[])

  useEffect(() => {
    if (isGeolocationDenied < 2 && (!localization || !weekWeather[0].temp)) {
      return setCanShowContent(false)
    }
    
    setCanShowContent(true)
  }, [isGeolocationDenied, localization, weekWeather])

  return (
    <div className="App">
      <header className="App-header">
        <h1 id="title" translate="no">Our Weather</h1>
      </header>

    {!canShowContent && <span id="geolocation-denied-msg">
        you must allow the site to access your location or set one manually
      </span>}

      {canShowContent && <main className="App-content">

        <h2 id="local-and-time">
          {localization} - <time>{time}</time>
        </h2>
        
        {weekWeather[0].icon &&  <WeatherIcon id="weather" aria-labelledby="desc" icon={weekWeather[0].icon} iconId={weekWeather[0].iconId} />}

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
      </main>}
      
      {canShowContent && <WeekWeather weekWeather={weekWeather} week={week} />}

      <button id="change-location" onClick={() => setIsChangingLocation(!isChangingLocation)}>Change location</button>

      <input 
        ref={changeLocationRef} 
        onBlur={() => setIsChangingLocation(false)} 
        onKeyDown={e => changeLocation(e)}
        style={{ display: isChangingLocation ? "initial" : "none" }} 
        placeholder="Albany, NY" name="address" id="address-ipt" />

      {canShowContent && <span id="icon-author" title="Freepik">
        Icons made by&nbsp;
        <a href="https://www.freepik.com" title="Freepik" target="_blank" rel="noopener noreferrer">
          Freepik&nbsp;
        </a> 
        from&nbsp;
        <a href="https://www.flaticon.com/" target="_blank" rel="noopener noreferrer" title="Flaticon">
          www.flaticon.com
        </a>
      </span>}

      <footer className="App-footer">
        <a href="https://github.com/lukas1013/our-weather" target="_blank" rel="noopener noreferrer" id="github">
          Github
        </a>
      </footer>
    </div>

  );
}

export default App;
