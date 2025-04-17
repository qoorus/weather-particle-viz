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

import { getCoordinates } from '../../composables/useWeatherAPI'

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