precision highp float;

varying vec2 vUv;

uniform sampler2D uTex;
uniform float uTime;

void main() {

  vec2 uv = vec2(
    vUv.x
    + step(0.2, vUv.y) * (exp(-uTime*0.01))
    + step(0.4, vUv.y) * (exp(-uTime*0.01))
    + step(0.6, vUv.y) * (exp(-uTime*0.005))
    + step(0.8, vUv.y) * (-exp(-uTime* 0.001)),
    vUv.y
    + step(0.2, vUv.x) * (exp(-uTime*0.001))
    + step(0.4, vUv.x) * (-exp(-uTime*0.002))
    + step(0.75, vUv.x) * (-exp(-uTime*0.002))

);
//  uv = floor(uv.xy / 0.1 ) * 0.1;

  gl_FragColor = texture2D(uTex, uv);
}