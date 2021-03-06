import { useEffect, useMemo, useRef, useCallback, lazy, Suspense, useReducer } from 'react';
import { IoMdRefreshCircle } from 'react-icons/io';
import * as geocodeApi from './services/geocode';
import * as weatherApi from './services/weather';
import reducer, { initialState } from './reducer';
import './App.css';
import * as storage from './storage';

const WeatherIcon = lazy(() => import('./components/WeatherIcon'));
const WeekWeather = lazy(() => import('./components/WeekWeather'));

function App() {
  const changeLocationRef = useRef(null);
  const lang = useMemo(() => {
    const navLang = navigator.language
    //formating for the API
    return navLang.slice(0,2) + '_' + navLang.slice(-2).toUpperCase()
  }, []);

  const [state,dispatch] = useReducer(reducer, initialState);

  const clock = useCallback(() => {
    const timer = setInterval(() => dispatch({ type: 'setTime' }), 1000);
    
    return () => clearInterval(timer);
  }, []);

  const getWeekWeather = useCallback(async (coords) => {
    if (coords?.latitude || state.coordinates?.latitude) {
      const coordinates = coords?.latitude ? coords : state.coordinates
      return await weatherApi.getWeekWeather(coordinates, lang).then(weWeather => {
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
          const weekWeather = await getWeekWeather(coords)
          dispatch({
            type: 'init',
            value: { coords, address, weekWeather }
          })
        } catch (err) {
          return console.log(err.message);
        }
      }, err => console.log(err.message), { enableHighAccuracy: true, timeout: 1000 * 10, maximumAge: 0 })
    }
  }, [getWeekWeather]);

  const changeLocation = useCallback(e => {
      if (e.key === "Enter" && state.newLocation.match(/^[[a-z\s???????????????????????????????????]+[,\s]?[a-z]{2}?/i)) { 
        geocodeApi.getGeocode(state.newLocation.replace(/[\s,]/g, '+')).then(response => {
          const [ coords, address ] = response;
          return weatherApi.getLocalizationWeather(coords, lang).then(weWeather => {
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

  const updateLocation = useCallback(() => {
    dispatch({ type: 'reset' })
  },[])

  useEffect(() => {
    if (storage.alreadyExpired()) {
      dispatch({ type: 'reset' })
    }
  }, []);

  useEffect(() => {
    const hasData = state.weekWeather[0]?.temp && state.address && state.coordinates?.latitude
    if (hasData) {
      return false
    }

    navigator.permissions.query({ name: 'geolocation' }).then(permission => {
      if (permission !== 'denied') {
        init()
      }
    })
    return false
  }, [state.weekWeather, state.address, state.coordinates, init])
  
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

        <button id="update" onClick={updateLocation} title="Update location">
          <IoMdRefreshCircle />
        </button>
      </header>

    {!state.canShowContent && <span id="geolocation-denied-msg">
        you must allow the site to access your location or set one manually
      </span>}

      {state.canShowContent && <main className="App-content" style={{ display: state.weekWeather[0].temp ? 'grid' : 'none' }}>

        <h2 id="local-and-time">
          {state.address} - <time>{state.time}</time>
        </h2>
        
        <Suspense fallback={null}>
          <WeatherIcon id="weather" aria-labelledby="desc" icon={state.weekWeather[0].icon} iconId={state.weekWeather[0].iconId} />
        </Suspense>

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
      
      <Suspense fallback={null}>
        <WeekWeather weekWeather={state.weekWeather} week={state.week} style={{display: state.weekWeather[0].temp ? 'initial' : 'none'}}/>
      </Suspense>

      <button id="change-location" onClick={() => dispatch({ type: 'is changing location', value: !state.isChangingLocation })}>Change location</button>

      <input 
        ref={changeLocationRef} 
        value={state.newLocation}
        onBlur={() => dispatch({ type: 'is changing location', value: false })} 
        onKeyDown={e => changeLocation(e)}
        onChange={e => dispatch({ type: 'typing new location', value: e.target.value })}
        style={{ display: state.isChangingLocation ? "initial" : "none" }} 
        placeholder="Albany, NY" name="address" id="address-ipt" />

      {state.canShowContent && <span id="icon-author" title="Freepik" style={{ display: state.weekWeather[0].temp ? 'initial' : 'none' }}>
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
