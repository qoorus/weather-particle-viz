import { beforeEach, describe, it, expect } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

mockNuxtImport('useRuntimeConfig', () => {
    return () => ({
        public: {
            apiKey: 'test-api-key'
        }
    })
})

const mockUseFetchResponse = vi.fn()
mockNuxtImport('useFetch', () => {
    return () => ({
        data: {
            value: mockUseFetchResponse()
        },
        error: {
            value: null
        },
        execute: vi.fn(() => {
            return new Promise((resolve) => {
                resolve(mockUseFetchResponse())
            })
        }),
    })
})

import { useWeatherAPI } from '../../composables/useWeatherAPI'

describe('useWeatherAPI', () => {
    let weatherAPI: ReturnType<typeof useWeatherAPI>

    beforeEach(() => {
        weatherAPI = useWeatherAPI()
    })

    it('正常に座標が取得できる場合', async () => {
        const mockResponse = [{ lat: 35.6895, lon: 139.6917 }]
        mockUseFetchResponse.mockReturnValue(mockResponse)

        const coordinates = await weatherAPI.getCoordinates('Tokyo')
        expect(coordinates).toEqual({ lat: 35.6895, lon: 139.6917 })
    })

    it('座標が見つからない場合エラーが投げられる', async () => {
        const mockResponse: any[] = []
        mockUseFetchResponse.mockReturnValue(mockResponse)
        await expect(weatherAPI.getCoordinates('InvalidCity')).rejects.toThrow('InvalidCityの座標が見つかりませんでした')
    })

    it('正常に天気データが取得できる場合', async () => {
        const mockResponse = { weather: [{ main: 'Clear', description: 'clear sky' }] }
        mockUseFetchResponse.mockReturnValue(mockResponse)

        const weather = await weatherAPI.getCurrentWeather(35.6895, 139.6917)
        expect(weather).toEqual({ stateMain: 'Clear', stateDescription: 'clear sky' })
    })

    it('天気データが取得できない場合エラーが投げられる', async () => {
        const mockResponse = null
        mockUseFetchResponse.mockReturnValue(mockResponse)

        await expect(weatherAPI.getCurrentWeather(999, 999)).rejects.toThrow('天気データが取得できませんでした')
    })

})