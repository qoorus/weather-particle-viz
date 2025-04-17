const config = useRuntimeConfig()
const apiKey = config.public.apiKey

const baseUrlGeocoding = 'https://api.openweathermap.org/geo/1.0/direct'
const baseUrlCurrentWeather = 'https://api.openweathermap.org/data/2.5/weather'

async function getCoordinates(cityName: string): Promise<{lat: number, lon: number}> {
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