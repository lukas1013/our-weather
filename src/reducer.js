import { getHours } from './helpers/dateAndTime';
import * as storage from './storage';

const days = ['Sunday','Monday','Tuesday','Wednesday','Thusday','Friday','Saturday'];

const initialState = ({
    address: storage.retrieve('address'),
    coordinates: JSON.parse(storage.retrieve('coords')),
    timeZone: storage.retrieve('timeZone'),
    time: (() => getHours(storage.retrieve('timeZone')))(),
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
    weekWeather: JSON.parse(storage.retrieve('weekWeather')) || [{}],
    isChangingLocation: false,
    canShowContent: storage.retrieve('address') || storage.retrieve('weekWeather'),
    lastUpdate: null
  });

function reducer(state, action) {
    const newState = {...state};
    
    switch (action.type) {
        case 'init':
            newState.address = action.value.address
            newState.coordinates = action.value.coords
            newState.weekWeather = action.value.weekWeather
            newState.timeZone = action.value.weekWeather[0].timeZone
            newState.canShowContent = true
            storage.save(['address','coords','weekWeather','timeZone'],[newState.address,JSON.stringify(newState.coordinates),JSON.stringify(newState.weekWeather),newState.timeZone])
            break
        case 'change location':
            const { address } = action.value
            newState.weekWeather = action.value.weekWeather
            newState.address = `${address.city}, ${address.stateCode || address.countryCode}`;
            newState.timeZone = newState.weekWeather[0].timeZone
            newState.canShowContent = true
            newState.isChangingLocation = false
            newState.newLocation = ''
            storage.save(['address','coords','weekWeather','timeZone'],[newState.address,JSON.stringify(newState.coordinates),JSON.stringify(newState.weekWeather),newState.timeZone])
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
        case 'reset':
            storage.clearStorage()
            storage.save('last update', getHours())
            newState.weekWeather = [{}]
            newState.address = null
            newState.coordinates = {}
            newState.canShowContent = false
            break
        // case 'setTime':
        default:
            newState.time = getHours(newState.timeZone)
            if (/00:00|12:00 AM/.test(newState.time) && newState.today !== newState.days[new Date().getDay()]) {
                newState.today = newState.days[new Date().getDay()]
                const { week }  = newState
                // take the first value and put it at the end
                week.push(week.shift());
                newState.week = week
            }
            break
    }

    return {...newState}
}

export { reducer as default, initialState }