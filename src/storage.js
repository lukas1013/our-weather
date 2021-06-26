import { getHours, isAfter, setMinutes } from './helpers/dateAndTime';

function save(entry, value, persist = true) {
    const storage = persist ? localStorage : sessionStorage;
    try {
        if (entry instanceof Array) {
            entry.forEach((item, key) => value[key] ? storage.setItem(item, value[key]) : false)
        } else {
            if (value) {
                storage.setItem(entry,value)
            }
        }
    } catch (e) {
        console.log(e.message)
    }

    if (entry === 'weekWeather' || (entry instanceof Array && entry.find(key => key === 'weekWeather'))) {
        setExpirationTime(30)
    }

}

function retrieve(entry) {
    try {
        const value = localStorage.getItem(entry) || sessionStorage.getItem(entry)
        return value
    } catch (e) {
        console.log(e.massage)
    }
}

function setExpirationTime(expiresIn = 30, currentTime = getHours(retrieve('locale'),retrieve('timeZone'))) {
    const hour = setMinutes(expiresIn, currentTime)
    const expirationTime = { hour, day: new Date().getDate() };
    save('expirationTime', JSON.stringify(expirationTime), true)
}

function alreadyExpired(currentHour = getHours()) {
    try {
        const expirationTime = JSON.parse(retrieve('expirationTime'));
        
        if (!expirationTime) {
            return false
        }
        
        const hasExpired = isAfter({ hour: currentHour, day: new Date().getDate() }, expirationTime)
        
        return hasExpired
    } catch(e) {
        console.log(e)
    }
}

function clearStorage() {
    try {
        sessionStorage.clear()
        localStorage.clear()
    } catch(e) {
        console.log(e.message)
    }
}

export { save, retrieve, alreadyExpired, clearStorage };