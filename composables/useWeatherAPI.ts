const config = useRuntimeConfig()
const apiKey = config.public.apiKey

const baseUrlGeocoding = 'https://api.openweathermap.org/geo/1.0/direct'
const baseUrlCurrentWeather = 'https://api.openweathermap.org/data/2.5/weather'

export async function getCoordinates(cityName: string): Promise<{lat: number, lon: number}> {
    try {
        const geoCoordinates = await useFetch<{ lat: number; lon: number }[]>(baseUrlGeocoding, {
            params: {
                q: cityName,
                limit: 1,
                appid: apiKey,
            }
        })
        const data = await geoCoordinates.data.value
        if (data && data.length > 0) {
            return {
                lat: data[0].lat,
                lon: data[0].lon
            }
        } else {
            throw new Error(`${cityName}の座標が見つかりませんでした`)
        }
    } catch (error) {
        console.error('座標取得中にエラーが発生しました:', error)
        throw error
    }
}

export async function getCurrentWeather(lat: number, lon: number): Promise<any> {
    try {
        const weatherData = await useFetch<{ weather: { main: string; description: string }[] }>(baseUrlCurrentWeather, {
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

export async function getCurrentWeatherFromCityName(cityName: string): Promise<{ stateMain: string; stateDescription: string }> {
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