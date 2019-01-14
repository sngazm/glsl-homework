import * as THREE from 'three';
import loadShader from './loadShader.js';
import * as dat from 'dat.gui';
import io from 'socket.io-client';
import OrbitControls from 'orbit-controls-es6';
const gui = new dat.GUI();


// -----------------
// Init scene
// -----------------


class SignMesh extends THREE.Mesh {
  constructor (texture) {
    super();
    let geometry = new THREE.PlaneBufferGeometry(100, 100, 128, 128);
    this.geometry = geometry;


    console.log(texture)
    const self = this;
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      console.log('load', texture);
      const shaderNum = Math.floor(Math.random() * 2);
      loadShader(`public/shader/${shaderNum}.vert`, `public/shader/${shaderNum}.frag`, function(vert, frag) {
        const material = new THREE.RawShaderMaterial({
          vertexShader: vert,
          fragmentShader: frag,
          transparent: true,
          uniforms: {
            uTime: {
              type: 'f',
              value: 0.0
            },
            uTex: {
              type: 't',
              value: texture
            }
          },
          side: THREE.DoubleSide
        });
        self.material = material;
        // uTimeに渡す最初の時間
        self.startTime = 0;
      });


    // 基準の値からランダムに遠いところを指す
    const randFar = (max, min, base) => {
      return base + (Math.random() * (max - min) + min) * Math.sign((Math.random() - 0.5));
    };

    // 基準の値からランダムに近いところをさす
    const randNear = (max, base) => {
      return base + (Math.random() * max) * Math.sign((Math.random() - 0.5))
    }

    this.positionA = new THREE.Vector3(randFar(500, 0, 0), randFar(500, 300, 0), randFar(800, 300, -200));
    this.positionB = new THREE.Vector3(randNear(200, 0), randNear(100, 0), randNear(100, -100));



    this.floatPosition = this.positionB.clone()
      .sub(this.positionA)
      .divideScalar(3);// 開始から3分の1いったとこ

    this.status = 'standby'; // standby, starting, floating, ending, end
    this.t = 0;
    this.end = 300;
    this.floatT = 0;
    this.floatingTime = 500;
    this.position.set(this.positionA.x, this.positionA.y, this.positionA.z);
    this.direction = this.positionB.clone().sub(this.positionA).normalize();
    this.floatSpeed = 0.5;
    this.rotationAngle = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize();
    this.rotationSpeed = Math.random() * 0.02;

    this.startTime;
    this.visible = false;
  }

  update() {

    let speed, v;

    switch (this.status) {
      case 'standby':
        break;

      case 'starting':
        if (!this.visible) this.visible = true;
        if (this.startTime !== undefined && this.startTime === 0) this.startTime = new Date().getTime();
        // 移動
        this.t++;
        speed = 10 * Math.exp(- this.t * 0.2 + 2);
        v = this.direction.clone().multiplyScalar(speed);
        this.position.add(v);

        // 回転
        this.rotateOnAxis(this.rotationAngle, this.rotationSpeed);


        if (v.length() <= this.floatSpeed) {
          console.log('floating');
          this.status = 'floating';
        }
        break;

      case 'floating':
        this.floatT++;
        v = this.direction.clone().multiplyScalar(this.floatSpeed);
        this.position.add(v);

        this.rotateOnAxis(this.rotationAngle, this.rotationSpeed);


        if (this.floatT >= this.floatingTime) {
          console.log('ending');
          this.status = 'ending'
        }
        break;

      case 'ending':
        this.t--;
        speed = 10 * Math.exp(- this.t * 0.2 + 2);
        v = this.direction.clone().multiplyScalar(speed);
        this.position.add(v);
        // 回転
        this.rotateOnAxis(this.rotationAngle, this.rotationSpeed);


        if (this.t <= -100) {
          this.status = 'end';
          console.log('end')
        }
        break;

      case 'end':

        break;
    }

    if (this.startTime !== undefined && this.startTime !== 0) {
      this.material.uniforms.uTime.value = new Date().getTime() - this.startTime;
      // console.log(this.material.uniforms.uTime.value)
    }

  }
}


// -----------------
// Init scene
// -----------------


window.THREE = THREE;

// Background Scene

const bgScene = new THREE.Scene();
bgScene.background = new THREE.Color(0xDAD7CD);

const bgCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 300);
bgCamera.position.set(0, 0, 300);
bgCamera.lookAt(new THREE.Vector3(0, 0, 0));


const bgRenderer = new THREE.WebGLRenderer({ alpha: true });
bgRenderer.setPixelRatio(1);
document.getElementById('wrap').appendChild(bgRenderer.domElement);
bgRenderer.setSize(window.innerWidth, window.innerHeight);



// Scene

const scene = new THREE.Scene();
window.scene = scene;
// scene.background = new THREE.Color(0xCCddAA);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 10000);
camera.position.set(0, 0, 300);
camera.lookAt(new THREE.Vector3(0, 0, 0));
scene.add(camera);

const gridHelper = new THREE.GridHelper(500, 50, 0xccaaaa);
scene.add(gridHelper);

const axis = new THREE.AxesHelper(1000);
scene.add(axis);

const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setPixelRatio(1);
document.getElementById('wrap').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);


// -----------------------------
// Main
// -----------------------------
// const controls = new OrbitControls(camera);
const texLoader = new THREE.TextureLoader();

const cube = new THREE.Mesh(
  new THREE.CubeGeometry(100, 100),
  new THREE.MeshBasicMaterial({
    color: 0x00ffff
  })
);
cube.position.set(0, 0, -100);
// scene.add(cube);

const objects = [];
let count = 0;
document.addEventListener('click', () => {
  // console.log(objects[count]);
  // objects[count++].status = 'starting';
  throwRandomSign();
});

const shapes = [
  {
    name: 'circle',
    num: 37
  },
  {
    name: 'triangle',
    num: 2
  },
  {
    name: 'square',
    num: 16
  }
];


// テクスチャを先に全部読み込んでおく
const textures = [];
for (let shape of shapes) {
  for (let i = 0; i < shape.num; i++) {
    texLoader.load(`public/images/${shape.name}_${i}.png`, texture => {
      textures.push(texture);
    })
  }
}

function throwRandomSign() {
  const randTex = textures[Math.floor(Math.random() * textures.length)];
  let signMesh = new SignMesh(randTex);
  objects.push(signMesh);
  scene.add(signMesh);
  signMesh.status = 'starting';
}


// for (let i = 0; i < 6; i++) {
//   // let signMesh = new SignMesh('public/images/' + i + '.png');
//   objects.push(signMesh);
//   scene.add(signMesh);
// }

// Background

const planeGeo = new THREE.PlaneBufferGeometry(100, 100);
const plane = new THREE.Mesh(planeGeo, new THREE.MeshBasicMaterial({
  color: 0xffaaaa
}));
bgScene.add(plane);

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
// Render the scenes
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
  bgRenderer.render(bgScene, bgCamera);
  renderer.render(scene, camera);
  for (let i = 0; i < objects.length; i++) {
    objects[i].update();
    if (objects[i].status === 'end') {
      scene.remove(objects[i]);
      objects[i].geometry.dispose();
      objects[i].material.dispose();
      objects.splice(i, 1);
    }
  }
};
renderLoop();

