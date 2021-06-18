export default function reducer(state, action) {
    const newState = {...state};
    
    console.log(action.type)
    switch (action.type) {
        case 'init':
            newState.address = action.value.address
            newState.coordinates = action.value.coords
            newState.weekWeather = action.value.weekWeather
            newState.canShowContent = true
            break
        case 'change location':
            const { address } = action.value
            newState.weekWeather = action.value.weekWeather
            newState.address = `${address.city}, ${address.stateCode || address.countryCode}`;
            newState.canShowContent = true
            newState.isChangingLocation = false
            break
        case 'is changing location':
            newState.isChangingLocation = action.value ?? !state.isChangingLocation
            break
        case 'can show content':
            newState.canShowContent = action.value
            break
        // case 'setTime':
        default:
            const locale = sessionStorage.getItem('lang'), timezone = newState.timezone
            const options = { hour: '2-digit', minute: '2-digit' }
            
            if (timezone) {
                options.timeZone = timezone
            }
            newState.time = new Intl.DateTimeFormat(locale || navigator.language, options).format(new Date())
            if (newState.time === '00:00' && newState.today !== newState.days[new Date().getDay()]) {
                newState.today = newState.days[new Date().getDay()]
            }
    }

    return {...newState}
}