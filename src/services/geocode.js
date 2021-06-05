import axios from 'axios';

import config from '../config/';

async function getGeocode(address) {
    const URL = config.geocoding.geocode.api;
    const API_KEY = config.geocoding.geocode.api_key;

    return await axios.get(`${URL + address}&apikey=${API_KEY}`).then(function ({ data }) {
        return [data.items[0].position, data.items[0].address]
    }).catch(err => console.log(err.message));
}

async function getReverseGeocode(coords) {
    const URL = config.geocoding.reverse.api;
    const ACCESS_KEY = config.geocoding.reverse.access_key;
console.log(config)
    return await axios.get(URL, {
        params: {
           access_key: ACCESS_KEY,
           query: `${coords.latitude}, ${coords.longitude}`,
           limit: 1
        },
    }).then(({ statusText, data: responseData }) => {
        const [data] = responseData.data
        if (statusText === "OK") {
            const address = `${data.county}, ${data.region_code}`;
            try {
                sessionStorage.setItem('address', address)
                sessionStorage.setItem('lat', coords.latitude)
                sessionStorage.setItem('long', coords.longitude)
                return address
            } catch (e) {
                console.log(e.message)
            }
        }
    }).catch(err => console.log(err.message))
}

export { getGeocode, getReverseGeocode }