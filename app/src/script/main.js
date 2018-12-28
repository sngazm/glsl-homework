import * as THREE from 'three';
import loadShader from './loadShader.js';
import * as dat from 'dat.gui';
import io from 'socket.io-client';

const gui = new dat.GUI();

// -----------------
// Init scene
// -----------------
window.THREE = THREE;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xDAD7CD);

const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 300);
camera.position.set(0, 0, 300);
camera.lookAt(new THREE.Vector3(0, 0, 0));


const axis = new THREE.AxesHelper(100);
scene.add(axis);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(1);
document.getElementById('wrap').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);



// -----------------------------
// Main
// -----------------------------
const planeGeo = new THREE.PlaneBufferGeometry(100, 100);
const plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
  color: 0xffaaaa
}));
scene.add(plane);

// 大本のパラメータはここに持たせとく
// 毎フレームここのパラメータがuniformsに反映されるようにする
const noiseParams = {
  np: new THREE.Vector3(0, 0, 0),
  // xstart: 0,
  // ystart: 0,
  // zstart: 0,
  xscale: 1.5,
  yscale: 1.5,
  zscale: 1,
  xspeed: 0.0,
  yspeed: 0.0,
  zspeed: 0.001,
  xskew: 0.0,
  yskew: 0.0,
  threshold: 0.5,
  thresholdwidth: 0.02,
};

const colorParams = {
  roffset: 0.0,
  goffset: 0.0,
  boffset: 0.0,
  rrotate: 0.0,
  grotate: 0.0,
  brotate: 0.0,
  rmosaic: 0.0,
  gmosaic: 0.0,
  bmosaic: 0.0,
};

const updateNoise = () => {
  noiseParams.np.x += noiseParams.xspeed;
  noiseParams.np.y += noiseParams.yspeed;
  noiseParams.np.z += noiseParams.zspeed;
};

const uniforms = {
  "u_resolution": {
    type: 'v2',
    value: new THREE.Vector2(
      window.innerWidth,
      window.innerHeight
    )
  },
  "u_time": {
    type: 'f',
    value: 0
  },
  "u_np": {
    type: 'v3',
    value: new THREE.Vector3(
      0,
      0,
      0
    )
  },
  "u_xscale": {
    type: 'f',
    value: noiseParams.xscale
  },
  "u_yscale": {
    type: 'f',
    value: noiseParams.yscale
  },
  "u_zscale": {
    type: 'f',
    value: noiseParams.zscale
  },
  "u_xspeed": {
    type: 'f',
    value: noiseParams.xspeed
  },
  "u_yspeed": {
    type: 'f',
    value: noiseParams.yspeed
  },
  "u_zspeed": {
    type: 'f',
    value: noiseParams.zspeed
  },
  "u_xskew": {
    type: 'f',
    value: noiseParams.xskew
  },
  "u_yskew": {
    type: 'f',
    value: noiseParams.yskew
  },
  "u_threshold": {
    type: 'f',
    value: noiseParams.threshold
  },
  "u_thresholdwidth": {
    type: 'f',
    value: noiseParams.thresholdwidth
  },
  "u_roffset": {
    type: 'f',
    value: colorParams.roffset
  },
  "u_goffset": {
    type: 'f',
    value: colorParams.goffset
  },
  "u_boffset": {
    type: 'f',
    value: colorParams.boffset
  },
  "u_rrotate": {
    type: 'f',
    value: colorParams.rrotate
  },
  "u_grotate": {
    type: 'f',
    value: colorParams.grotate
  },
  "u_brotate": {
    type: 'f',
    value: colorParams.brotate
  },
  "u_rmosaic": {
    type: 'f',
    value: colorParams.rmosaic
  },
  "u_gmosaic": {
    type: 'f',
    value: colorParams.gmosaic
  },
  "u_bmosaic": {
    type: 'f',
    value: colorParams.bmosaic
  },
};

const noiseFolder = gui.addFolder('noiseParams');
noiseFolder.add(noiseParams, 'xscale', -10, 10, 0.1).listen();
noiseFolder.add(noiseParams, 'yscale', -10, 10, 0.1).listen();
noiseFolder.add(noiseParams, 'zscale', -10, 10, 0.1).listen();
noiseFolder.add(noiseParams, 'xspeed', -0.1, 0.1, 0.01).listen();
noiseFolder.add(noiseParams, 'yspeed', -0.1, 0.1, 0.01).listen();
noiseFolder.add(noiseParams, 'zspeed', -0.02, 0.02, 0.001).listen();
noiseFolder.add(noiseParams, 'xskew', -1.0, 1.0, 0.01).listen();
noiseFolder.add(noiseParams, 'yskew', -1.0, 1.0, 0.01).listen();
noiseFolder.add(noiseParams, 'threshold', -1, 1, 0.01).listen();
noiseFolder.add(noiseParams, 'thresholdwidth', 0, 2, 0.01).listen();

const colorFolder = gui.addFolder('colorParams');
colorFolder.add(colorParams, 'roffset', -1, 1, 0.01).listen();
colorFolder.add(colorParams, 'goffset', -1, 1, 0.01).listen();
colorFolder.add(colorParams, 'boffset', -1, 1, 0.01).listen();
colorFolder.add(colorParams, 'rrotate', -3.14, 3.14, 0.01).listen();
colorFolder.add(colorParams, 'grotate', -3.14, 3.14, 0.01).listen();
colorFolder.add(colorParams, 'brotate', -3.14, 3.14, 0.01).listen();
colorFolder.add(colorParams, 'rmosaic', 0, 1, 0.001).listen();
colorFolder.add(colorParams, 'gmosaic', 0, 1, 0.001).listen();
colorFolder.add(colorParams, 'bmosaic', 0, 1, 0.001).listen();

loadShader('public/shader/toon.vert', 'public/shader/toon.frag', function(vert, frag) {
  const planeMtrl = new THREE.RawShaderMaterial({
    vertexShader: vert,
    fragmentShader: frag,
    uniforms: uniforms
  });
  plane.material = planeMtrl;
});

function applyUniforms(param) {
  for (let paramName in param) {
    uniforms["u_" + paramName].value = param[paramName];
  }
}

// -----------------------------
// Socket.io
// -----------------------------
const socket = io.connect();
socket.on('server_to_client', (data) => {
  console.log(data);
});
socket.on('update_sliderparams', (data) => {
  for (let param in noiseParams) {
    if(param == data.key) {
      noiseParams[data.key] = data.value;
      return;
    }
  }
  for (let param in colorParams) {
    if(param == data.key) {
      colorParams[data.key] = data.value;
      return;
    }
  }

});


// -----------------------------
// Render the scene
// -----------------------------
let startTime;
let time = 0;
const renderLoop = () => {
  requestAnimationFrame(renderLoop);
  if (plane.material.type === "RawShaderMaterial") {
    if (!startTime) {
      startTime = new Date().getTime();
    }
    time = new Date().getTime() - startTime;
    uniforms.u_time.value = time;
    updateNoise();
    applyUniforms(noiseParams);
    applyUniforms(colorParams);
  }
  renderer.render(scene, camera);
};
renderLoop();

