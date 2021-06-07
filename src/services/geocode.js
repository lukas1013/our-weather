import axios from 'axios';

import config from '../config/';

async function getGeocode(address) {
    const URL = config.geocoding.geocode.api;
    const API_KEY = config.geocoding.geocode.api_key;

    return await axios.get(`${URL + address}&apikey=${API_KEY}`).then(function ({ data }) {
        const resposeAddress = data.items[0].address
        const coords = {
            latitude: data.items[0].position.lat,
            longitude: data.items[0].position.lng
        }
        return [coords, resposeAddress]
    }).catch(err => console.log(err.message));
}

async function getReverseGeocode(coords) {
    const URL = config.geocoding.reverse.api;
    const ACCESS_KEY = config.geocoding.reverse.access_key;
    
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
                sessionStorage.setItem('coords', JSON.stringify(coords))
                return address
            } catch (e) {
                console.log(e.message)
            }
        }
    }).catch(err => console.log(err.message))
}

export { getGeocode, getReverseGeocode }