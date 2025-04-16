<template>
  <div ref="canvasContainer" class="particle-canvas"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useThree } from '~/composables/useThree'
import { createWeatherParticles, WeatherType } from '~/utils/particles/particleSystem'

// プロップス定義
const props = defineProps<{
  weatherType: WeatherType;
  interactive?: boolean;
}>()

// キャンバスコンテナへの参照
const canvasContainer = ref<HTMLElement | null>(null)

// Three.jsフック
const { initialize, scene, startAnimation, stopAnimation } = useThree()

// パーティクルシステムの参照
let weatherParticles: ReturnType<typeof createWeatherParticles> | null = null

// マウス位置
const mouse = ref({ x: 0, y: 0 })
const mouseVector = new THREE.Vector3()

// マウスイベントハンドラー
const handleMouseMove = (event: MouseEvent) => {
  if (!canvasContainer.value || !props.interactive) return
  
  // キャンバス内でのマウス位置を正規化
  const rect = canvasContainer.value.getBoundingClientRect()
  mouse.value.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.value.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
}

// アニメーション更新関数
const updateAnimation = (time: number) => {
  if (!weatherParticles) return
  
  // 前のフレームからの経過時間（秒単位）
  const deltaTime = 0.016 // およそ60fps
  
  // パーティクルを更新
  weatherParticles.update(deltaTime)
  
  // インタラクティブモードの場合はマウスに反応
  if (props.interactive && mouse.value.x !== 0 && mouse.value.y !== 0) {
    mouseVector.set(mouse.value.x * 5, mouse.value.y * 5, 0)
    weatherParticles.applyForce(mouseVector, 2, 0.01)
  }
}

// 天気タイプが変更された時の処理
watch(() => props.weatherType, (newType, oldType) => {
  if (weatherParticles && newType !== oldType) {
    weatherParticles.changeWeather(newType)
  }
})

// コンポーネントマウント時の処理
onMounted(() => {
  if (!canvasContainer.value) return
  
  // Three.jsを初期化
  const { width, height } = canvasContainer.value.getBoundingClientRect()
  initialize(canvasContainer.value, width, height)
  
  // パーティクルシステムを作成
  weatherParticles = createWeatherParticles(scene.value, props.weatherType)
  
  // マウスイベントリスナーを追加
  if (props.interactive) {
    window.addEventListener('mousemove', handleMouseMove)
  }
  
  // アニメーションを開始
  startAnimation(updateAnimation)
})

// コンポーネントのクリーンアップ
onBeforeUnmount(() => {
  stopAnimation()
  
  if (props.interactive) {
    window.removeEventListener('mousemove', handleMouseMove)
  }
  
  if (weatherParticles) {
    weatherParticles.dispose()
    weatherParticles = null
  }
})
</script>

<style scoped>
.particle-canvas {
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: linear-gradient(to bottom, #1e3c72, #2a5298);
  overflow: hidden;
}
</style>