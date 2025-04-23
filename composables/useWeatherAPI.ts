interface GeocodingResponse {
    name: string;
    lat: number;
    lon: number;
    country: string;
    state?: string;
}

interface WeatherData {
    weather: Array<{
        id: number;
        main: string;
        description: string;
        icon: string;
    }>;
    main: {
        temp: number;
        feels_like: number;
        temp_min: number;
        temp_max: number;
        pressure: number;
        humidity: number;
    };
    wind: {
        speed: number;
        deg: number;
    };
    clouds: {
        all: number;
    };
    sys: {
        country: string;
        sunrise: number;
        sunset: number;
    };
    name: string;
}

export function useWeatherAPI() {

    const config = useRuntimeConfig()
    const apiKey = config.public.apiKey
    
    const baseUrlGeocoding = 'https://api.openweathermap.org/geo/1.0/direct'
    const baseUrlCurrentWeather = 'https://api.openweathermap.org/data/2.5/weather'
    
    const getCoordinates = async (cityName: string) => {
        try {
            const { data: geoResponse, error } = await useFetch(baseUrlGeocoding, {
                params: {
                    q: cityName,
                    limit: 1,
                    appid: apiKey,
                }
            })
            const coordinates = await geoResponse.value as GeocodingResponse[]
            if (error.value) {
                throw error.value
            }
            return {
                lat: coordinates[0].lat,
                lon: coordinates[0].lon
            }
        } catch (e) {
            console.error('座標取得中にエラーが発生しました:', e)
            throw e
        }
    }

    const getCurrentWeather = async (lat: number, lon: number) => {
        try {
            const { data: weatherResponse, error }= await useFetch(baseUrlCurrentWeather, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: apiKey,
                    units: 'metric' // メトリック単位（摂氏）
                }
            })
            const currentWeather = await weatherResponse.value as WeatherData
            if (error.value) {
                throw error.value
            }
            return {
                stateMain: currentWeather.weather[0].main,
                stateDescription: currentWeather.weather[0].description,
            }
        } catch (e) {
            console.error('天気データ取得中にエラーが発生しました:', e)
            throw e
        }

    }

    const getCurrentWeatherFromCityName = async (cityName: string) => {
        try {
            const coordinates = await getCoordinates(cityName)
            const weather = await getCurrentWeather(coordinates.lat, coordinates.lon)
            return {
                stateMain: weather.stateMain,
                stateDescription: weather.stateDescription,
            }
        } catch (e) {
            console.error('天気情報取得中にエラーが発生しました:', e)
            throw e
        }
    }
    return {
        getCoordinates,
        getCurrentWeather,
        getCurrentWeatherFromCityName
    }
}