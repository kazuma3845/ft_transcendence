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
light.position.set( 6, 12, 3 ); //default; light shining from top
light.castShadow = true; // default false
scene.add( light );

//Set up shadow properties for the light
light.shadow.mapSize.width = 512; // default
light.shadow.mapSize.height = 512; // default
light.shadow.camera.near = 0.5; // default
light.shadow.camera.far = 500; // default

//Create a sphere that cast shadows (but does not receive them)
const vertexShader = `
    varying vec2 vUv;
    void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    void main() {
        vec3 color1 = vec3(0.4, 0, 0.8 );
        vec3 color2 = vec3(0.5, 1, 1);
        vec3 color = mix(color1, color2, vUv.y);
        gl_FragColor = vec4(color, 1.0);
    }
`;

const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader
});

const sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32);
const sphere = new THREE.Mesh(sphereGeometry, material);
sphere.castShadow = true; // default is false
sphere.receiveShadow = false; // default
scene.add(sphere);

// //--------------------line right---------------------------------------
// const LRightGeometry = new THREE.BoxGeometry(5, 5, 0.01);
// const LRightMaterial = new THREE.MeshLambertMaterial( { color: 0xfff } );
// const LRight = new THREE.Mesh( LRightGeometry, LRightMaterial );
// // LRight.translateX( 0 );
// // LRight.translateY( 0 );
// LRight.castShadow = true; //default is false
// LRight.receiveShadow = false; //default
// scene.add( LRight );

// //--------------------line left---------------------------------------
// const LLeftGeometry = new THREE.BoxGeometry(0.2, 5, 0);
// const LLeftMaterial = new THREE.MeshLambertMaterial( { color: 0xfff } );
// const LLeft = new THREE.Mesh( LLeftGeometry, LLeftMaterial );
// LLeft.translateX( - 14.8 );
// LLeft.translateY( 0 );
// LLeft.castShadow = true; //default is false
// LLeft.receiveShadow = false; //default
// scene.add( LLeft );

//Create a plane that receives shadows (but does not cast them)
const planeGeometry = new THREE.PlaneGeometry( 30, 20, 1, 1 );
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
const LRightGeometry = new THREE.BoxGeometry(0.2, 5, 0);
const LRightMaterial = new THREE.MeshBasicMaterial( { color: 0xfff } );
const LRight = new THREE.Mesh( LRightGeometry, LRightMaterial );
LRight.translateX( 14.8 );
LRight.translateY( 0 );
LRight.castShadow = true; //default is false
LRight.receiveShadow = false; //default
scene.add( LRight );

//--------------------line left---------------------------------------
const LLeftGeometry = new THREE.BoxGeometry(0.2, 5, 0);
const LLeftMaterial = new THREE.MeshBasicMaterial( { color: 0xfff } );
const LLeft = new THREE.Mesh( LLeftGeometry, LLeftMaterial );
LLeft.translateX( - 14.8 );
LLeft.translateY( 0 );
LLeft.castShadow = true; //default is false
LLeft.receiveShadow = false; //default
scene.add( LLeft );

//--------------------affichage---------------------------------------

camera.position.z = 15;

function animate() {

	sphere.rotation.x += 0.01;
	sphere.rotation.y += 0.01;
queueMicrotask
	renderer.render( scene, camera );

}
