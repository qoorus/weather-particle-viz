import * as THREE from 'three'

// 天気タイプの定義
export type WeatherType = 'Clear' | 'Rain' | 'Snow' | 'Clouds' | 'Thunderstorm' | 'Fog'

// パーティクルの設定インターフェース
interface ParticleSystemOptions {
  count: number;
  size: number;
  area: {
    width: number;
    height: number;
    depth: number;
  };
  color: string | string[];
  opacity: number;
  speedFactor: number;
}

// 天気タイプごとのデフォルト設定
const DEFAULT_OPTIONS: Record<WeatherType, ParticleSystemOptions> = {
  Clear: {
    count: 1000,
    size: 0.05,
    area: { width: 10, height: 10, depth: 10 },
    color: '#ffdd55', // 明るい黄色
    opacity: 0.8,
    speedFactor: 0.2
  },
  Rain: {
    count: 1500,
    size: 0.02,
    area: { width: 10, height: 15, depth: 10 },
    color: '#88ccff', // 薄い青
    opacity: 0.6,
    speedFactor: 1.0
  },
  Snow: {
    count: 1000,
    size: 0.04,
    area: { width: 10, height: 15, depth: 10 },
    color: '#ffffff', // 白
    opacity: 0.7,
    speedFactor: 0.3
  },
  Clouds: {
    count: 800,
    size: 0.1,
    area: { width: 10, height: 8, depth: 10 },
    color: '#cccccc', // 灰色
    opacity: 0.5,
    speedFactor: 0.1
  },
  Thunderstorm: {
    count: 1800,
    size: 0.03,
    area: { width: 10, height: 15, depth: 10 },
    color: ['#88ccff', '#ffff00'], // 青と黄色（雨と稲妻）
    opacity: 0.7,
    speedFactor: 1.2
  },
  Fog: {
    count: 500,
    size: 0.15,
    area: { width: 10, height: 10, depth: 10 },
    color: '#dddddd', // 薄い灰色
    opacity: 0.3,
    speedFactor: 0.05
  }
}

// パーティクルシステムクラス
export class WeatherParticleSystem {
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private particles: THREE.Points;
  private velocities: THREE.Vector3[];
  private weatherType: WeatherType;
  private options: ParticleSystemOptions;
  
  constructor(weatherType: WeatherType, customOptions?: Partial<ParticleSystemOptions>) {
    this.weatherType = weatherType;
    this.options = { ...DEFAULT_OPTIONS[weatherType], ...customOptions };
    this.geometry = new THREE.BufferGeometry();
    this.velocities = [];
    
    // パーティクルの初期位置を設定
    this.initializeParticles();
    
    // マテリアルの作成
    this.material = new THREE.PointsMaterial({
      size: this.options.size,
      transparent: true,
      opacity: this.options.opacity,
      vertexColors: Array.isArray(this.options.color)
    });
    
    // 単色の場合はマテリアルの色を設定
    if (!Array.isArray(this.options.color)) {
      this.material.color = new THREE.Color(this.options.color);
    }
    
    // パーティクルシステムの作成
    this.particles = new THREE.Points(this.geometry, this.material);
  }
  
  // パーティクルの初期位置と速度を設定
  private initializeParticles() {
    const { width, height, depth } = this.options.area;
    const positions = new Float32Array(this.options.count * 3);
    const colors = Array.isArray(this.options.color) 
      ? new Float32Array(this.options.count * 3) 
      : null;
    
    for (let i = 0; i < this.options.count; i++) {
      const i3 = i * 3;
      
      // ランダムな位置を設定
      positions[i3] = (Math.random() - 0.5) * width;      // x
      positions[i3 + 1] = (Math.random() - 0.5) * height; // y
      positions[i3 + 2] = (Math.random() - 0.5) * depth;  // z
      
      // 複数色の場合、ランダムに色を割り当て
      if (colors && Array.isArray(this.options.color)) {
        const colorIndex = Math.floor(Math.random() * this.options.color.length);
        const color = new THREE.Color(this.options.color[colorIndex]);
        colors[i3] = color.r;
        colors[i3 + 1] = color.g;
        colors[i3 + 2] = color.b;
      }
      
      // 速度ベクトルを作成
      const velocity = this.createVelocityForWeather(this.weatherType);
      this.velocities.push(velocity);
    }
    
    // ジオメトリに位置属性を設定
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // 複数色の場合は色属性を設定
    if (colors) {
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    }
  }
  
  // 天気タイプに応じたパーティクルの速度を作成
  private createVelocityForWeather(weatherType: WeatherType): THREE.Vector3 {
    const randomFactor = Math.random() * this.options.speedFactor;
    
    switch (weatherType) {
      case 'Clear':
        // 晴れの場合はゆっくりと上昇
        return new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          0.01 + randomFactor * 0.01,
          (Math.random() - 0.5) * 0.01
        );
        
      case 'Rain':
        // 雨の場合は下に落ちる
        return new THREE.Vector3(
          (Math.random() - 0.5) * 0.01,
          -0.05 - randomFactor * 0.05,
          (Math.random() - 0.5) * 0.01
        );
        
      case 'Snow':
        // 雪の場合はゆらゆらと落ちる
        return new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          -0.01 - randomFactor * 0.02,
          (Math.random() - 0.5) * 0.02
        );
        
      case 'Clouds':
        // 雲の場合はゆっくりと水平に移動
        return new THREE.Vector3(
          (Math.random() - 0.3) * 0.01,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        );
        
      case 'Thunderstorm':
        // 嵐の場合は速い雨と不規則な動き
        return new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          -0.08 - randomFactor * 0.08,
          (Math.random() - 0.5) * 0.04
        );
        
      case 'Fog':
        // 霧の場合はとてもゆっくりとランダムに動く
        return new THREE.Vector3(
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005,
          (Math.random() - 0.5) * 0.005
        );
        
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }
  
  // パーティクルの更新（アニメーションフレームごとに呼ばれる）
  public update(deltaTime: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    const { width, height, depth } = this.options.area;
    
    for (let i = 0; i < this.options.count; i++) {
      const i3 = i * 3;
      const velocity = this.velocities[i];
      
      // 位置を更新
      positions[i3] += velocity.x * deltaTime;
      positions[i3 + 1] += velocity.y * deltaTime;
      positions[i3 + 2] += velocity.z * deltaTime;
      
      // 領域の端に到達したらリセット
      this.resetParticleIfNeeded(i, i3, positions, width, height, depth);
    }
    
    // 特殊エフェクト（天気タイプによる）
    this.applySpecialEffects(deltaTime);
    
    // 更新を通知
    this.geometry.attributes.position.needsUpdate = true;
  }
  
  // 領域外に出たパーティクルを元に戻す
  private resetParticleIfNeeded(
    i: number, 
    i3: number, 
    positions: Float32Array, 
    width: number, 
    height: number, 
    depth: number
  ) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    const halfDepth = depth / 2;
    
    switch (this.weatherType) {
      case 'Rain':
      case 'Snow':
      case 'Thunderstorm':
        // 下に落ちるパーティクル（雨、雪、嵐）
        if (positions[i3 + 1] < -halfHeight) {
          positions[i3 + 1] = halfHeight;
          positions[i3] = (Math.random() - 0.5) * width;
          positions[i3 + 2] = (Math.random() - 0.5) * depth;
        }
        break;
        
      case 'Clear':
        // 上に上がるパーティクル（晴れ）
        if (positions[i3 + 1] > halfHeight) {
          positions[i3 + 1] = -halfHeight;
          positions[i3] = (Math.random() - 0.5) * width;
          positions[i3 + 2] = (Math.random() - 0.5) * depth;
        }
        break;
        
      default:
        // 領域外に出たら反対側から再登場
        if (positions[i3] < -halfWidth) positions[i3] = halfWidth;
        if (positions[i3] > halfWidth) positions[i3] = -halfWidth;
        if (positions[i3 + 1] < -halfHeight) positions[i3 + 1] = halfHeight;
        if (positions[i3 + 1] > halfHeight) positions[i3 + 1] = -halfHeight;
        if (positions[i3 + 2] < -halfDepth) positions[i3 + 2] = halfDepth;
        if (positions[i3 + 2] > halfDepth) positions[i3 + 2] = -halfDepth;
    }
  }
  
  // 特殊エフェクトの適用（天気タイプによる）
  private applySpecialEffects(deltaTime: number) {
    switch (this.weatherType) {
      case 'Thunderstorm':
        // 稲妻エフェクト（ランダムな点滅）
        if (Math.random() < 0.01) {
          this.material.opacity = 1.0;
          setTimeout(() => {
            this.material.opacity = this.options.opacity;
          }, 100);
        }
        break;
        
      case 'Fog':
        // 霧のエフェクト（ふわふわと動きを変える）
        for (let i = 0; i < this.velocities.length; i++) {
          if (Math.random() < 0.01) {
            this.velocities[i].x = (Math.random() - 0.5) * 0.005;
            this.velocities[i].y = (Math.random() - 0.5) * 0.005;
            this.velocities[i].z = (Math.random() - 0.5) * 0.005;
          }
        }
        break;
    }
  }
  
  // マウス/タッチイベントに応じてパーティクルを動かす
  public applyForce(position: THREE.Vector3, radius: number, strength: number) {
    const positions = this.geometry.attributes.position.array as Float32Array;
    
    for (let i = 0; i < this.options.count; i++) {
      const i3 = i * 3;
      const particlePos = new THREE.Vector3(
        positions[i3],
        positions[i3 + 1],
        positions[i3 + 2]
      );
      
      // パーティクルとマウス位置の距離を計算
      const distance = particlePos.distanceTo(position);
      
      // 影響範囲内であれば力を適用
      if (distance < radius) {
        const force = position.clone().sub(particlePos);
        force.normalize().multiplyScalar(strength * (1 - distance / radius));
        
        // 速度に影響を与える
        this.velocities[i].add(force);
      }
    }
  }
  
  // パーティクルシステムを取得
  public getParticles(): THREE.Points {
    return this.particles;
  }
  
  // 天気タイプを変更
  public changeWeather(weatherType: WeatherType, transitionDuration: number = 2.0) {
    const oldWeatherType = this.weatherType;
    this.weatherType = weatherType;
    
    // 新しいオプションを適用
    const newOptions = DEFAULT_OPTIONS[weatherType];
    
    // トランジションを開始
    const startTime = Date.now();
    const updateTransition = () => {
      const elapsedTime = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsedTime / transitionDuration, 1.0);
      
      // 色のトランジション
      if (!Array.isArray(this.options.color) && !Array.isArray(newOptions.color)) {
        const startColor = new THREE.Color(this.options.color);
        const endColor = new THREE.Color(newOptions.color);
        const currentColor = new THREE.Color().lerpColors(startColor, endColor, progress);
        this.material.color = currentColor;
      }
      
      // サイズと不透明度のトランジション
      this.material.size = this.options.size * (1 - progress) + newOptions.size * progress;
      this.material.opacity = this.options.opacity * (1 - progress) + newOptions.opacity * progress;
      
      // 速度の更新
      if (progress < 1.0) {
        requestAnimationFrame(updateTransition);
      } else {
        // トランジション完了時に新しいオプションを完全に適用
        this.options = { ...newOptions };
        
        // 速度を天気タイプに合わせて更新
        for (let i = 0; i < this.velocities.length; i++) {
          this.velocities[i] = this.createVelocityForWeather(weatherType);
        }
      }
    };
    
    updateTransition();
  }
  
  // リソースの解放
  public dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ユーティリティ関数: 天気タイプに基づいてパーティクルシステムを作成
export function createWeatherParticles(
  scene: THREE.Scene, 
  weatherType: WeatherType, 
  customOptions?: Partial<ParticleSystemOptions>
): WeatherParticleSystem {
  const particleSystem = new WeatherParticleSystem(weatherType, customOptions);
  scene.add(particleSystem.getParticles());
  return particleSystem;
}