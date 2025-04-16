import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'

export function useThree() {
  // リアクティブな参照を作成
  const container = ref<HTMLElement | null>(null)
  const scene = ref<THREE.Scene>(new THREE.Scene())
  const camera = ref<THREE.PerspectiveCamera | null>(null)
  const renderer = ref<THREE.WebGLRenderer | null>(null)
  const isInitialized = ref(false)
  
  // アニメーションループのID
  let animationFrameId: number | null = null
  
  // Three.jsの初期化関数
  const initialize = (el: HTMLElement, width: number, height: number) => {
    if (isInitialized.value) return
    
    container.value = el
    
    // カメラの設定
    camera.value = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
    camera.value.position.z = 5
    
    // レンダラーの設定
    renderer.value = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true // 背景を透明に
    })
    renderer.value.setSize(width, height)
    renderer.value.setPixelRatio(window.devicePixelRatio)
    
    // DOMにレンダラーを追加
    container.value.appendChild(renderer.value.domElement)
    
    // リサイズハンドラー
    const handleResize = () => {
      if (!container.value || !camera.value || !renderer.value) return
      
      const width = container.value.clientWidth
      const height = container.value.clientHeight
      
      camera.value.aspect = width / height
      camera.value.updateProjectionMatrix()
      
      renderer.value.setSize(width, height)
    }
    
    window.addEventListener('resize', handleResize)
    
    isInitialized.value = true
    
    return () => {
      window.removeEventListener('resize', handleResize)
      if (container.value && renderer.value) {
        container.value.removeChild(renderer.value.domElement)
      }
    }
  }
  
  // アニメーションループ開始
  const startAnimation = (animateCallback?: (time: number) => void) => {
    if (!renderer.value || !scene.value || !camera.value) return
    
    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate)
      
      // 外部から渡されたアニメーションコールバックを実行
      if (animateCallback) {
        animateCallback(time)
      }
      
      // シーンをレンダリング
      renderer.value!.render(scene.value!, camera.value!)
    }
    
    animationFrameId = requestAnimationFrame(animate)
  }
  
  // アニメーションの停止
  const stopAnimation = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }
  }
  
  // クリーンアップ
  onBeforeUnmount(() => {
    stopAnimation()
    
    // メモリリークを防ぐためのリソース解放
    if (scene.value) {
      scene.value.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) {
            object.geometry.dispose()
          }
          
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose())
            } else {
              object.material.dispose()
            }
          }
        }
      })
    }
    
    if (renderer.value) {
      renderer.value.dispose()
    }
  })
  
  return {
    container,
    scene,
    camera,
    renderer,
    initialize,
    startAnimation,
    stopAnimation,
    isInitialized
  }
}