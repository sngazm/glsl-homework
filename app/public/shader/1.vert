precision highp float;

uniform mat4 modelViewMatrix;  // モデルビュー行列。ローカル座標から視点系座標の変換します。modelViewMatrix = viewMatrix * modelViewMatrix
uniform mat4 projectionMatrix; // カメラのプロジェクション行列。日本語で透視変換行列とも呼びます。視点系座標からクリッピング座標に変換します。
uniform float uTime;

attribute vec3 position;
attribute vec3 normal;  // 頂点のローカル空間での法線の向き
attribute vec4 color;
attribute vec2 uv;

varying vec2 vUv;


void main() {
      vUv = uv;
      vec3 p = position;
//      p.z += cos(p.y / 10.0 + uTime / 300.0) * 5.0;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}