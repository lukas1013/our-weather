import { useEffect, useMemo, useRef, useCallback, lazy, Suspense, useReducer } from 'react';
import * as geocodeApi from './services/geocode';
import * as weatherApi from './services/weather';
import ISO6391 from 'iso-639-1';
import reducer from './reducer';
import './App.css';

const WeatherIcon = lazy(() => import('./components/WeatherIcon'));
const WeekWeather = lazy(() => import('./components/WeekWeather'));

function App() {
  const days = useMemo(() => ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'], []);
  const timezone = useMemo(() => sessionStorage.getItem('timeZone'), []);
  const changeLocationRef = useRef(null);
  const lang = useMemo(() => {
    const navLang = navigator.language
    //formating for the API
    return navLang.slice(0,2) + '_' + navLang.slice(-2).toUpperCase()
  }, []);
  
  const initialState = useMemo(() => ({
    address: sessionStorage.getItem('address'),
    coordinates: JSON.parse(sessionStorage.getItem('coords')),
    timezone: sessionStorage.getItem('timezone'),
    time: new Intl.DateTimeFormat(sessionStorage.getItem('lang') || navigator.language, timezone ? { hour: '2-digit', minute: '2-digit', timeZone: timezone } : { hour: '2-digit', minute: '2-digit'}).format(new Date()),
    days: ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'],
    today: (() => days[new Date().getDay()])(),
    week: (() => {
      const w = [], today = days[new Date().getDay()];
      if (today === 'Saturday') {
        w.push(...days)
      } else {
        w.push(...([...days].splice(days.indexOf(today)+1).concat(days)))
      }
      
      return w
    })(),  
    weekWeather: JSON.parse(sessionStorage.getItem('week_weather')) || [{}],
    isChangingLocation: false,
    canShowContent: !!sessionStorage.getItem('address'),
  }), [days,timezone]);

  const [state,dispatch] = useReducer(reducer, initialState);

  const clock = useCallback(() => {
    const timer = setInterval(() => {
      dispatch({ type: 'setTime' })
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getWeekWeather = useCallback(async () => {
    if (state.coordinates?.latitude) {
      return await weatherApi.getWeekWeather(state.coordinates, lang).then(weWeather => {
        sessionStorage.setItem('week_weather', JSON.stringify(weWeather))
        return weWeather
      }).catch(e => console.log(e))
    } 

    return [{}]
  },[state.coordinates, lang]);
  
  const init = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        try {
          const { latitude, longitude } = coords
          const address = await geocodeApi.getReverseGeocode({ latitude, longitude });
          const weekWeather = await getWeekWeather()
          sessionStorage.setItem('coords', JSON.stringify(coords))
          sessionStorage.setItem('address', address);
          sessionStorage.setItem('week_weather', JSON.stringify(weekWeather))
          console.log(weekWeather)
          dispatch({
            type: 'init',
            value: { coords, address, weekWeather }
          })
        } catch (err) {
          return console.log(err.message);
        }
      }, err => console.log(err.message), { enableHighAccuracy: true, timeout: 1000 * 5, maximumAge: 0 })
    }
  }, [getWeekWeather]);

  const changeLocation = useCallback(e => {
      if (e.key === "Enter" && state.newLocation.match(/^[[a-z\sáàãâçéèẽêíìîóòôúù]+[,\s]?[a-z]{2}?/i)) { 
        geocodeApi.getGeocode(state.newLocation.replace(/[\s,]/g, '+')).then(response => {
          const [ coords, address ] = response;
          return weatherApi.getLocalizationWeather(coords, lang).then(weWeather => {
            sessionStorage.setItem('address', `${address.city}, ${address.stateCode || address.countryCode}`)
            sessionStorage.setItem('coords', JSON.stringify(coords))
            sessionStorage.setItem('lang', ISO6391.getCode(address.city || address.state))
            sessionStorage.setItem('timeZone', weWeather[0].timeZone);
            sessionStorage.setItem('week_weather', JSON.stringify(weWeather));
            dispatch({ 
              type: 'change location', value: { 
                weekWeather: weWeather,
                address
              }
            })
          })
        })
      } else {

      }
  }, [lang, state.newLocation]);

  const canShowContentFunc = useCallback(async () => {
    const coords = JSON.parse(sessionStorage.getItem('coords')), weWeather = JSON.parse(sessionStorage.getItem('week_weather'))
    const hasCoordinates = (coords instanceof Object && Object.keys(coords).length), hasWeekWeather = (weWeather instanceof Array && weWeather.length);

    if (hasCoordinates || hasWeekWeather) {
      return dispatch({ type: 'can show content', value: true });
    }

    const permission = await navigator.permissions.query({ name: 'geolocation' })
    let canShowContent = false, isGeolocationDenied = 0

    if (permission.state === 'granted') {
      isGeolocationDenied = 2
    } else if (permission.state === 'denied') {
      isGeolocationDenied = 1
    }

    if (isGeolocationDenied === 2) {
      dispatch({ type: 'can show content', value: canShowContent })
    }

  },[]);

  useEffect(() => {
    canShowContentFunc()
  }, [canShowContentFunc]);

  useEffect(() => {
    if (!state.weekWeather[0].temp) {
      init()
    }
    return false
  }, [state.weekWeather, init])
  
  useEffect(() => {
    clock()
  }, [clock])

  useEffect(() => {
    if (state.isChangingLocation) {
      changeLocationRef.current.focus()
    }
  }, [state.isChangingLocation])

  return (
    <div className="App">
      <header className="App-header">
        <h1 id="title" translate="no">Our Weather</h1>
      </header>

    {!state.canShowContent && <span id="geolocation-denied-msg">
        you must allow the site to access your location or set one manually
      </span>}

      {state.canShowContent && <main className="App-content">

        <h2 id="local-and-time">
          {state.address} - <time>{state.time}</time>
        </h2>
        
        {state.weekWeather[0].icon &&  <Suspense fallback={null}>
          <WeatherIcon id="weather" aria-labelledby="desc" icon={state.weekWeather[0].icon} iconId={state.weekWeather[0].iconId} />
        </Suspense>}

        <span id="degrees">
          {state.weekWeather[0].temp}
        </span>

        <span id="desc">
          {state.weekWeather[0].desc}
        </span>

        <span id="humidity">
          Humidity: {state.weekWeather[0].humidity}
        </span>

        <span id="wind">
          Wind: {state.weekWeather[0].wind}
        </span>
      </main>}
      
      {state.canShowContent && <Suspense fallback={null}>
        <WeekWeather weekWeather={state.weekWeather} week={state.week} />
      </Suspense>}

      <button id="change-location" onClick={() => dispatch({ type: 'is changing location', value: !state.isChangingLocation })}>Change location</button>

      <input 
        ref={changeLocationRef} 
        value={state.newLocation}
        onBlur={() => dispatch({ type: 'is changing location', value: false })} 
        onKeyDown={e => changeLocation(e)}
        onChange={e => dispatch({ type: 'typing new location', value: e.target.value })}
        style={{ display: state.isChangingLocation ? "initial" : "none" }} 
        placeholder="Albany, NY" name="address" id="address-ipt" />

      {state.canShowContent && <span id="icon-author" title="Freepik">
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
