import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

//--------------------sphere---------------------------------------
const geometry = new THREE.SphereGeometry(0.5, 20, 20);
const material = new THREE.MeshBasicMaterial( { color: 0xff477e } );

const cube = new THREE.Mesh( geometry, material );
scene.add( cube );

//--------------------cadre---------------------------------------
const mat = new THREE.LineBasicMaterial( { color: 0xff477e } );

const points = [];
points.push( new THREE.Vector3( - 15, 10, 0 ) );
points.push( new THREE.Vector3( 15, 10, 0 ) );
points.push( new THREE.Vector3( 15, - 10, 0 ) );
points.push( new THREE.Vector3( - 15, -10, 0 ) );
points.push( new THREE.Vector3( - 15, 10, 0 ) );
const geo = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geo, mat );
scene.add( line );

//--------------------line right---------------------------------------
const geom = new THREE.BoxGeometry(0.2, 5, 0);
const mate = new THREE.MeshBasicMaterial( { color: 0xff477e } );
const cu = new THREE.Mesh( geom, mate )
cu.translateX( 14.8 );
scene.add( cu );

//--------------------line left---------------------------------------
const geome = new THREE.BoxGeometry(0.2, 5, 0);
const mater = new THREE.MeshBasicMaterial( { color: 0xff477e } );
const cub = new THREE.Mesh( geome, mater )
cub.translateX( - 14.8 );
cub.translateY( 3 );
scene.add( cub );

//--------------------shadow left---------------------------------------
// //Create a WebGLRenderer and turn on shadows in the renderer
// const rendere = new THREE.WebGLRenderer();
// rendere.shadowMap.enabled = true;
// rendere.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

// //Create a DirectionalLight and turn on shadows for the light
// const light = new THREE.DirectionalLight( 0xffffff, 1 );
// light.position.set( 0, 1, 0 ); //default; light shining from top
// light.castShadow = true; // default false
// scene.add( light );

// //Set up shadow properties for the light
// light.shadow.mapSize.width = 512; // default
// light.shadow.mapSize.height = 512; // default
// light.shadow.camera.near = 0.5; // default
// light.shadow.camera.far = 500; // default

// //Create a sphere that cast shadows (but does not receive them)
// const sphereGeometry = new THREE.SphereGeometry( 5, 32, 32 );
// const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xff0000 } );
// const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
// sphere.castShadow = true; //default is false
// sphere.receiveShadow = false; //default
// scene.add( sphere );

// //Create a plane that receives shadows (but does not cast them)
// const planeGeometry = new THREE.PlaneGeometry( 20, 20, 32, 32 );
// const planeMaterial = new THREE.MeshStandardMaterial( { color: 0x00ff00 } )
// const plane = new THREE.Mesh( planeGeometry, planeMaterial );
// plane.receiveShadow = true;
// scene.add( plane );

// //Create a helper for the shadow camera (optional)
// const helper = new THREE.CameraHelper( light.shadow.camera );

//--------------------affichage---------------------------------------
camera.position.z = 15;

function animate() {

	cube.rotation.x += 0.01;
	cube.rotation.y += 0.01;
queueMicrotask
	renderer.render( scene, camera );

}
