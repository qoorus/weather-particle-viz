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
        }
    })
})

import { getCoordinates, getCurrentWeather } from '../../composables/useWeatherAPI'

describe('getCoordinates', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('正常に座標を取得できる場合', async () => {

        mockUseFetchResponse.mockReturnValue([
            { lat: 35.6895, lon: 139.6917 }
        ])

        const result = await getCoordinates('Tokyo')

        expect(result).toEqual({
            lat: 35.6895,
            lon: 139.6917
        })
    })

    it('座標が見つからない場合はエラーがスローされる', async () => {
        // 空の配列を返すようにモック設定
        mockUseFetchResponse.mockReturnValue([])

        await expect(getCoordinates('存在しない都市')).rejects.toThrow('存在しない都市の座標が見つかりませんでした')
    })

    it('APIがエラーを返した場合', async () => {
        // エラーをスローするモック
        mockUseFetchResponse.mockImplementation(() => {
            throw new Error('API error')
        })

        await expect(getCoordinates('Tokyo')).rejects.toThrow('API error')
    })

})

describe('getCurrentWeather', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('正常に天気データを取得できる場合', async () => {
        mockUseFetchResponse.mockReturnValue({
            weather: [
                { main: 'Clear', description: 'clear sky' }
            ]
        })

        const result = await getCurrentWeather(35.6895, 139.6917)

        expect(result).toEqual({
            stateMain: 'Clear',
            stateDescription: 'clear sky'
        })
    })

    it('天気データが取得できない場合はエラーがスローされる', async () => {
        // nullを返すようにモック設定
        mockUseFetchResponse.mockReturnValue(null)

        await expect(getCurrentWeather(35.6895, 139.6917)).rejects.toThrow('天気データが取得できませんでした')
    })

    it('APIがエラーを返した場合', async () => {
        // エラーをスローするモック
        mockUseFetchResponse.mockImplementation(() => {
            throw new Error('API error')
        })

        await expect(getCurrentWeather(35.6895, 139.6917)).rejects.toThrow('API error')
    })
})