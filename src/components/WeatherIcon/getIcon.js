import ICONS from './constants';

export default async function getIcon(iconId, api_icon) {
    let id
    if (iconId === 800 || iconId === 801) {
        const isDay = !!api_icon.match(/d/)
        id = isDay ? iconId + 'd' : iconId + 'n' 
    } else {
        id = iconId
    }

    try {
        const src = await import('../../assets/' + ICONS[id])
        return src.default
    } catch(err) {
        console.log(err.message)
    }
} 