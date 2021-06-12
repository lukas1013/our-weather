const config = {
    geocoding: {
        geocode: {
            api: 'https://geocode.search.hereapi.com/v1/geocode?q='
        },
        reverse: {
            api: 'https://revgeocode.search.hereapi.com/v1/revgeocode'
        },
        api_key: process.env.REACT_APP_GEOCODING_API_KEY
    },
    weather: {
        api: 'https://api.openweathermap.org/data/2.5/onecall',
        appid: process.env.REACT_APP_WEATHER_APPID
    }
}

export { config as default }