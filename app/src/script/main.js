import * as THREE from 'three';
import OrbitControls from 'orbit-controls-es6';

// -----------------
// Init scene
// -----------------
window.THREE = THREE;
const scene = new THREE.Scene();
window.scene = scene;
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 15000);
camera.position.set(0, 200, 300);
camera.lookAt(new THREE.Vector3(0, 0, 0));

const ambLight = new THREE.AmbientLight( 0x404040, 0.2 );
scene.add(ambLight);

const lights = [];
lights[ 0 ] = new THREE.PointLight( 0xffffff, 0.7, 0  );
lights[ 1 ] = new THREE.PointLight( 0xffffff, 0.7, 0 );
lights[ 2 ] = new THREE.PointLight( 0xffffff, 0.7, 0 );

lights[ 0 ].position.set(  200,  200,  200); // Key light
lights[ 1 ].position.set( -200,  100,  100 ); // Fill light
lights[ 2 ].position.set( -100, -100, -100 ); // Back light

scene.add( lights[ 0 ] );
scene.add( lights[ 1 ] );
scene.add( lights[ 2 ] );

const lightHelpers = [];
for(let i = 0; i < lights.length; i++) {
  lightHelpers[i] = new THREE.PointLightHelper(lights[i], 100, 0xff0000);
  scene.add(lightHelpers[i]);
}

const axis = new THREE.AxesHelper(100);
scene.add(axis);

const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setPixelRatio(1);
document.getElementById('wrap').appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);




// -----------------------------
// Main
// -----------------------------

// -----------------------------
// Camera Control
// -----------------------------
const control = new OrbitControls(camera);


// -----------------------------
// Render the scene
// -----------------------------
const renderLoop = () => {
  requestAnimationFrame(renderLoop);
  renderer.render(scene, camera);
};
renderLoop();
