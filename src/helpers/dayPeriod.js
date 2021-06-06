export default function getDayPeriod(time, locale = 'en-US') {
    const localTime = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit' }).format(time)
    const hour = localTime.split(':')[0];
    let period;
    switch (hour) {
        case localTime.match(/PM$/) && hour >= 0 && hour <= 5:
        case hour >= 0 && hour <= 5:
            period = 'night';
            break
        case localTime.match(/PM$/) && hour >= 6 && hour <= 11:
        case hour >= 18 && hour <= 23:
            period = 'eve';
            break
        case localTime.match(/AM$/) && hour >= 12 && hour <= 5:
        case hour >= 12 && hour <= 17:
            period = 'day';
            break
        default:
            period = 'morn'

    }

    return period
}