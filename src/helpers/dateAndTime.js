function getHours(timeZone) {
    try {
        const options = { 
            hour: '2-digit',
            minute: '2-digit', 
        }

        if (timeZone) {
            options.timeZone = timeZone
        }
        const hours = new Intl.DateTimeFormat([], options).format(new Date())
        return hours
    } catch (e) {
        console.log(e.message)
    }
}

function setMinutes(minutes, hour1) {
    let [hour,minute,period] = hour1.split(/:|\s/);
    hour = parseInt(hour)
    minute = parseInt(minute)
    for (let i = 0; i < minutes; i++) {
        // 12 hours format
        if (hour === 12 && period && minute === 59) {
            hour = 1
            minute = 0
            continue
        }

        // 24 hours format
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
    return `${hour}:${minute}${period ? ' ' + period : ''}`
}
//testar formato 12 horas
function isAfter(time1, time2) {
    const [hr1, min1] = time1.hour.split(/:|\s/), [hr2, min2] = time2.hour.split(/:|\s/);
        let after = false
        
        if (time1.day > time2.day) {
            after = true
        } else if (time1.day === time2.day) {
            if (hr1 === hr2 && parseInt(min1) > parseInt(min2)) {
                after = true
            } else if (parseInt(hr1) > parseInt(hr2)) {
                after = true
            }
        }
        return after
}

export { getHours, setMinutes, isAfter }