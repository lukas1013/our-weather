import { useState, useEffect } from 'react';
import getIcon from './getIcon';

export default function WeatherIcon(props) {
    const [iconSrc, setIconSrc] = useState('');
    
    useEffect(() => {
        getIcon(props.iconId,props.icon).then(src => setIconSrc(src))
    }, [props]);

    return <img id={props.id} className={props.className} src={iconSrc} alt="" title={props.title} />
}