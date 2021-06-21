import getHours from "./utils/getHours";

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
    let [hour,minute,period] = currentTime.split(/:|\s/);
    hour = parseInt(hour)
    minute = parseInt(minute)
    for (let i = 0; i < expiresIn; i++) {
        if (hour === 12 && period && minute === 59) {
            hour = 1
            minute = 0
            continue
        }

        if (minute === 59) {
            hour = hour === 23 ? 0 : hour + 1; 
            minute = 0
            continue
        }

        minute += 1
    }
    // 2-digit format
    hour = hour < 10 ? '0' + hour : hour;
    minute = minute < 10 ? '0' + minute : minute;
    const expirationTime = { hour: `${hour}:${minute}${period ? ' ' + period : ''}` };
    expirationTime.day = new Date().getDate();
    save('expirationTime', JSON.stringify(expirationTime), true)
}

function alreadyExpired(currentTime) {
    try {
        const expirationTime = JSON.parse(retrieve('expirationTime'));

        if (!expirationTime) {
            return false
        }

        const [expirationHour, expiratioMinute] = expirationTime.hour.split(/:|\s/), [currentHour, currentMinute] = currentTime.split(/:|\s/);
        let hasExpired = false
        
        if (new Date().getDate() > expirationTime.day) {
            hasExpired = true
        } else if (expirationHour === currentHour && parseInt(currentMinute) > parseInt(expiratioMinute)) {
            hasExpired = true
        } else if (parseInt(currentHour) > parseInt(expirationHour)) {
            hasExpired = true
        }

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