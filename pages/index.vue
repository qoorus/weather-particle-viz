<script setup lang="ts">
import { getCurrentWeatherFromCityName } from '~/composables/useWeatherAPI'

const cityName = 'Kyoto'
const weatherState = await getCurrentWeatherFromCityName(cityName)
const weatherStateMain = weatherState.stateMain
const weatherStateDescription = weatherState.stateDescription

</script>

<template>
    <div class="container">
        <h1>京都の今の天気はー？</h1>
        <p>天気：{{ weatherStateMain }}</p>
        <p>詳細：{{ weatherStateDescription }}</p>
    </div>
</template>
