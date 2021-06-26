import axios from 'axios';

import config from '../config/';

async function getGeocode(address) {
    const URL = config.geocoding.geocode.api;
    const API_KEY = config.geocoding.api_key;

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
    const APIKEY = config.geocoding.api_key;
    
    return await axios.get(URL, {
        params: {
           at: `${coords.latitude},${coords.longitude}`,
           limit: 1,
           apikey: APIKEY
        },
    }).then(({ data }) => {
        try {
            const { address: responseAddress } = data.items[0]
            const address = responseAddress.city + ', ' + responseAddress.state
            return address
        } catch (e) {
            console.log(e.message)
        }
    }).catch(err => console.log(err.message))
}

export { getGeocode, getReverseGeocode }