import { useContext, createContext, useReducer, useEffect, useState, useMemo } from "react";

import reducer from './reducer';

const WeatherContext = createContext({});

export function WeatherProvider({ children }) {
    
}

export function useWeather() {
    const context = useContext(WeatherContext);
    return context
}