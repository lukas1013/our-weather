const config = {
    geocoding: {
        geocode: {
            api: 'https://geocode.search.hereapi.com/v1/geocode?q=',
            api_key: process.env.REACT_APP_GEOCODE_API_KEY
        },
        reverse: {
            api: 'http://api.positionstack.com/v1/reverse',
            access_key: process.env.REACT_APP_REVERSE_API_KEY
        }
    }
}

export { config as default }