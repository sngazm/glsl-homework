precision mediump float;

varying vec2 vUv;
varying float vTime;

uniform sampler2D uTex;
//uniform float uTime;

void main() {
//  vec2 uv = vec2(vUv.x + vTime / 100.0, vUv.y);
  gl_FragColor = texture2D(uTex, vUv);
}