import getHours from "./utils/getHours";
import * as storage from './storage';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'];

const initialState = ({
    address: storage.retrieve('address'),
    coordinates: JSON.parse(storage.retrieve('coords')),
    timeZone: storage.retrieve('timeZone'),
    time: (() => getHours())(),
    days: ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'],
    today: (() => days[new Date().getDay()])(),
    week: (() => {
      const newWeek = [], today = days[new Date().getDay()];
      if (today === 'Saturday') {
        newWeek.push(...days)
      } else {
        const w = days.slice(days.indexOf(today) + 1)
        w.push(...(days.slice(0, days.indexOf(today) + 1)))
        newWeek.push(...w)
      }
      
      return newWeek
    })(),  
    weekWeather: JSON.parse(storage.retrieve('week_weather')) || [{}],
    isChangingLocation: false,
    canShowContent: storage.retrieve('address') || storage.retrieve('week_weather'),
  });

function reducer(state, action) {
    const newState = {...state};
    
    console.log(action.type)
    switch (action.type) {
        case 'init':
            newState.address = action.value.address
            newState.coordinates = action.value.coords
            newState.weekWeather = action.value.weekWeather
            newState.canShowContent = true
            break
        case 'change location':
            const { address } = action.value
            newState.weekWeather = action.value.weekWeather
            newState.address = `${address.city}, ${address.stateCode || address.countryCode}`;
            newState.canShowContent = true
            newState.isChangingLocation = false
            newState.newLocation = ''
            break
        case 'is changing location':
            newState.isChangingLocation = action.value ?? !state.isChangingLocation
            break
        case 'typing new location':
            newState.newLocation = action.value
            break
        case 'can show content':
            newState.canShowContent = action.value
            break
        // case 'setTime':
        default:
            newState.time = getHours()
            if (/00:00|12:00 AM/.test(newState.time) && newState.today !== newState.days[new Date().getDay()]) {
                newState.today = newState.days[new Date().getDay()]
                const { week }  = newState
                // take the first value and put it at the end
                week.push(week.shift());
                newState.week = week
            }
    }

    return {...newState}
}

export { reducer as default, initialState }