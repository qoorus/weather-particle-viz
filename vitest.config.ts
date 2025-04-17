import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    environment: 'nuxt',
    // テスト対象ファイル
    include: ['tests/unit/*.test.ts'],
  },
})