import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

//--------------------shadow---------------------------------------
//Create a WebGLRenderer and turn on shadows in the renderer
const rendere = new THREE.WebGLRenderer();
rendere.shadowMap.enabled = true;
rendere.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap

//Create a DirectionalLight and turn on shadows for the light
const light = new THREE.DirectionalLight( 0xffffff, 3 );
light.position.set( 6, 12, 10 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

//Create a sphere that cast shadows (but does not receive them)
const sphereGeometry = new THREE.SphereGeometry( 0.5, 32, 32 );
const sphereMaterial = new THREE.MeshStandardMaterial( { color: 0xfff } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.castShadow = true; //default is false
sphere.receiveShadow = false; //default
scene.add( sphere );

// //--------------------line right---------------------------------------
// const geom = new THREE.BoxGeometry(0.2, 5, 0);
// const mate = new THREE.MeshLambertMaterial( { color: 0xfff } );
// const cu = new THREE.Mesh( geom, mate );
// cu.translateX( 14.8 );
// cu.translateY( 0 );
// cu.castShadow = true; //default is false
// cu.receiveShadow = false; //default
// scene.add( cu );

// //--------------------line left---------------------------------------
// const geome = new THREE.BoxGeometry(0.2, 5, 0);
// const mater = new THREE.MeshLambertMaterial( { color: 0xfff } );
// const cub = new THREE.Mesh( geome, mater );
// cub.translateX( - 14.8 );
// cub.translateY( 0 );
// cub.castShadow = true; //default is false
// cub.receiveShadow = false; //default
// scene.add( cub );

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 30, 20, 32, 32 );
const planeMaterial = new THREE.MeshStandardMaterial( { color: 0xffffff } )
const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.receiveShadow = true;
scene.add( plane );

//--------------------cadre---------------------------------------
const mat = new THREE.LineBasicMaterial( { color: 0xffffff } );

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
const mate = new THREE.MeshBasicMaterial( { color: 0xfff } );
const cu = new THREE.Mesh( geom, mate );
cu.translateX( 14.8 );
cu.translateY( 0 );
cu.castShadow = true; //default is false
cu.receiveShadow = false; //default
scene.add( cu );

//--------------------line left---------------------------------------
const geome = new THREE.BoxGeometry(0.2, 5, 0);
const mater = new THREE.MeshBasicMaterial( { color: 0xfff } );
const cub = new THREE.Mesh( geome, mater );
cub.translateX( - 14.8 );
cub.translateY( 0 );
cub.castShadow = true; //default is false
cub.receiveShadow = false; //default
scene.add( cub );

//--------------------affichage---------------------------------------

//Create a helper for the shadow camera (optional)
const helper = new THREE.CameraHelper( light.shadow.camera );

camera.position.z = 15;

function animate() {

	sphere.rotation.x += 0.01;
	sphere.rotation.y += 0.01;
queueMicrotask
	renderer.render( scene, camera );

}
