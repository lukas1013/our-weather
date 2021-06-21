export default function getHours(locale,timeZone) {
    try {
        const options = { 
            hour: '2-digit',
            minute: '2-digit', 
        }

        if (timeZone) {
            options.timeZone = timeZone
        }
        const hours = new Intl.DateTimeFormat(locale || navigator.language, options).format(new Date())
        return hours
    } catch (e) {
        console.log(e.message)
    }
}