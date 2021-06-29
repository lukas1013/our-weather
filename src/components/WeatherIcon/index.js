import { useState, useEffect, memo } from 'react';
import getIcon from './getIcon';

function WeatherIcon(props) {
    const [iconSrc, setIconSrc] = useState('');
    
    useEffect(() => {
        if (!props.iconId) {
            return false
        }
        
        getIcon(props.iconId,props.icon).then(src => setIconSrc(src))
    }, [props]);

    return (
        <img id={props.id}
         className={props.className} 
         title={props.title} 
         alt=""
         aria-labelledby={props['aria-labelledby']} 
         tabIndex={props.tabIndex}
         src={iconSrc}
        />
    )
}

export default memo(WeatherIcon);