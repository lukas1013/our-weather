import WeatherIcon from '../WeatherIcon';

export default function WeekWeather(props) {

    return (
        <article id="week">
            <table id="week-content">
                <caption tabIndex="1">7 day weather</caption>
                <thead>
                    <tr>
                        {props.weekWeather.slice(1).map((item, key) => {
                            const index = key === 0 ? 2 : 5 + (key - 1) * 4 + 1;

                            return (
                                <th key={key} className="day" tabIndex={index} colSpan="1" scope="col">{props.week[key].slice(0, 3)}<span className="long">{props.week[key].slice(3)}</span></th>
                            )
                        })}
                    </tr>
                </thead>
                <tbody>
                    <tr className="weather-row">
                        {props.weekWeather.slice(1).map((item, key) => {
                            const index = key === 0 ? 3 : 5 + (key - 1) * 4 + 1
                            return (
                                <td key={key} className="weather-container">
                                    {item.icon && <WeatherIcon tabIndex={index} className="weather" title={item.title} aria-labelledby={'desc' + (key + 1)} icon={item.icon} iconId={item.iconId} />}
                                </td>
                            )
                        })}
                    </tr>
                    <tr>
                        {props.weekWeather.slice(1).map((item, key) => {
                            const index = key === 0 ? 4 : 5 + (key - 1) * 4 + 1
                            return (
                                <td key={key} tabIndex={index} className="degrees">{item.temp ?? ''}</td>
                            )
                        })}
                    </tr>
                    <tr>
                        {props.weekWeather.slice(1).map((item, key) => {
                            const index = key === 0 ? 5 : 5 + (key - 1) * 4 + 1
                            return (
                                <td key={key} id={'desc' + (key + 1)} tabIndex={index} className="desc">{item.desc}</td>
                            )
                        })}
                    </tr>
                </tbody>
            </table>
        </article>
    )
}