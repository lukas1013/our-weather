import { useState, useEffect, memo } from 'react';
import getIcon from './getIcon';

function WeatherIcon(props) {
    const [iconSrc, setIconSrc] = useState('');
    
    useEffect(() => {
        getIcon(props.iconId,props.icon).then(src => setIconSrc(src))
    }, [props]);

    return <img id={props.id} className={props.className} src={iconSrc} alt="" title={props.title} />
}

export default memo(WeatherIcon);