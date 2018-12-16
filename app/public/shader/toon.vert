
uniform mat4 modelMatrix;      // モデル行列。モデルをローカル座標からグローバル座標に変換します。
uniform mat4 modelViewMatrix;  // モデルビュー行列。ローカル座標から視点系座標の変換します。modelViewMatrix = viewMatrix * modelViewMatrix
uniform mat4 projectionMatrix; // カメラのプロジェクション行列。日本語で透視変換行列とも呼びます。視点系座標からクリッピング座標に変換します。
uniform mat3 normalMatrix;     // ローカル座標の法線を視点系座標に変換する行列です。
uniform vec3 cameraPosition;   // カメラのグローバル座標。
uniform float time;

attribute vec3 position;
attribute vec3 normal;  // 頂点のローカル空間での法線の向き
attribute vec4 color;

varying vec4 vColor;
varying vec3 vNormal;

void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
