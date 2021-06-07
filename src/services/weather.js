import axios from 'axios';
import getDayPeriod from '../helpers/dayPeriod';

import config from '../config/'; 

async function getWeekWeather(coords, lang = 'en_US') {
    const URL = config.weather.api;
    const APPID = config.weather.appid;

    if (!coords.latitude) {
        return [{}]
    }

    function captalize(string) {
        const firstLetter = string.charAt(0)
        return string.replace(firstLetter, firstLetter.toUpperCase())
    }

    return await axios.get(URL, {
        params: {
            lat: coords.latitude,
            lon: coords.longitude,
            exclude: "minutely,hourly,alerts",
            // lang,
            units: "metric",
            appid: APPID
        }
    }).then(({ data }) => {
        const { current, daily } = data

        const weWeather = [{
            temp: `${parseInt(current.temp)} °C | ${parseInt(current.temp * 1.8 + 32)} °F`,
            humidity: current.humidity + '%',
            wind: parseInt(current.wind_speed * 60 * 60 / 1000) + ' Km/h',
            weather: current.weather[0].main,
            desc: (() => captalize(current.weather[0].description))(),
            iconId: current.weather[0].id,
            icon: current.weather[0].icon
        }];

        let period = getDayPeriod(new Date())
        
        for (let i = 1; i <= 7; i++) {
            weWeather.push({
                temp: parseInt(daily[i].temp[period]) + ' °C',
                weather: daily[i].weather[0].main,
                desc: (() => captalize(daily[i].weather[0].description))(),
                iconId: daily[i].weather[0].id,
                icon: daily[i].weather[0].icon
            })
        }

        return weWeather
    }).catch(err => {
        console.log(err.message)
        return [{}]
    })
}

async function getLocalizationWeather(coords, lang = 'en_US') {
    
    try {
        const weWeather = await getWeekWeather(coords, lang);
        return weWeather
    } catch (err) {
        console.log(err.message)
    }
}

export { getWeekWeather, getLocalizationWeather }