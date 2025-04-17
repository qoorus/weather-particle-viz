<script setup lang="ts">
import { ref, onMounted } from 'vue'

const cityName = 'Kyoto'
const weatherStateMain = ref('読み込み中...')
const weatherStateDescription = ref('読み込み中...')
const error = ref('')

onMounted(async () => {
    try {
        const { getCurrentWeatherFromCityName } = useWeatherAPI()
        const weather = await getCurrentWeatherFromCityName(cityName)

        if (weather && weather.stateMain && weather.stateDescription) {
            weatherStateMain.value = weather.stateMain
            weatherStateDescription.value = weather.stateDescription
        } else {
            error.value = 'データの形式が不正です'
        }
    } catch (err: any) {
        console.error('Weather error:', err)
        error.value = err?.message || 'データの取得に失敗しました'
    }
})
</script>

<template>
    <div class="container">
        <h1>京都の今の天気はー？</h1>
        <div v-if="error" class="error">
            <p>エラー: {{ error }}</p>
        </div>
        <div v-else>
            <p>天気：{{ weatherStateMain }}</p>
            <p>詳細：{{ weatherStateDescription }}</p>
        </div>
    </div>
</template>

<style scoped>
.error {
    color: red;
}
</style>