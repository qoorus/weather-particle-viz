export function useWeatherAPI() {

    const config = useRuntimeConfig()
    const apiKey = config.public.apiKey
    
    const baseUrlGeocoding = 'https://api.openweathermap.org/geo/1.0/direct'
    const baseUrlCurrentWeather = 'https://api.openweathermap.org/data/2.5/weather'
    
    const getCoordinates = async (cityName: string) => {
        try {
            const geoCoordinates = await useFetch(baseUrlGeocoding, {
                params: {
                    q: cityName,
                    limit: 1,
                    appid: apiKey,
                }
            })
            const coordinates = await geoCoordinates.data.value

            if (coordinates) {
                return {
                    lat: coordinates[0].lat,
                    lon: coordinates[0].lon
                }
            } else {
                throw new Error(`${cityName}の座標が見つかりませんでした`)
            }
        } catch (error) {
            console.error('座標取得中にエラーが発生しました:', error)
            throw error
        }
    }
    
    const getCurrentWeather = async (lat: number, lon: number) => {
        try {
            const weatherData = await useFetch(baseUrlCurrentWeather, {
                params: {
                    lat: lat,
                    lon: lon,
                    appid: apiKey,
                    units: 'metric' // メトリック単位（摂氏）
                }
            })
            const currentWeather = await weatherData.data.value
            if (currentWeather) {
                return {
                    stateMain: currentWeather.weather[0].main,
                    stateDescription: currentWeather.weather[0].description,
                }
            } else {
                throw new Error('天気データが取得できませんでした')
            }
        } catch (error) {
            console.error('天気データ取得中にエラーが発生しました:', error)
            throw error
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
        } catch (error) {
            console.error('天気情報取得中にエラーが発生しました:', error)
            throw error
        }
    }
    return {
        getCoordinates,
        getCurrentWeather,
        getCurrentWeatherFromCityName
    }
}