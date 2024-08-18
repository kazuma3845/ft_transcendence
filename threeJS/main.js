import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setAnimationLoop( animate );
document.body.appendChild( renderer.domElement );

//------------------sphere-----------------------------------------
const sphereGeometry = new THREE.SphereGeometry( 0.8, 32, 32 );
const sphereMaterial = new THREE.MeshBasicMaterial( { color: 0xf99ff } );
const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
sphere.translateX( 0 );
sphere.translateY( 0 );
sphere.translateZ( 0.8 );
scene.add( sphere );

//--------------------arene------------------------------------------
const AreneGeomerty = new THREE.BoxGeometry(30, 20, 1);
const AreneMaterial = new THREE.MeshBasicMaterial( { color: 0xB72FED } );
const Arene = new THREE.Mesh( AreneGeomerty, AreneMaterial );
Arene.translateZ( -0.5 );
scene.add( Arene );

//--------------------line right---------------------------------------
const LRightGeometry = new THREE.BoxGeometry(0.5, 5, 1);
const LRightMaterial = new THREE.MeshBasicMaterial( { color: 0xfff } );
const LRight = new THREE.Mesh( LRightGeometry, LRightMaterial );
LRight.translateX( 14.5 );
LRight.translateZ( 0.5 );
LRight.translateY( 0 );
scene.add( LRight );

//--------------------line left---------------------------------------
const LLeftGeometry = new THREE.BoxGeometry(0.5, 5, 1);
const LLeftMaterial = new THREE.MeshBasicMaterial( { color: 0xfff } );
const LLeft = new THREE.Mesh( LLeftGeometry, LLeftMaterial );
LLeft.translateX( - 14.5 );
LLeft.translateZ( 0.5 );
LLeft.translateY( 0 );
scene.add( LLeft );

//-------------------bordure------------------------------------------
const LborderGeometry = new THREE.BoxGeometry(0.2, 19.6, 0.2);
const LbordertMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const Lborder = new THREE.Mesh( LborderGeometry, LbordertMaterial );
Lborder.translateX( - 14.9 );
Lborder.translateZ( 0.1 );
Lborder.translateY( 0 );
scene.add( Lborder );

const RborderGeometry = new THREE.BoxGeometry(0.2, 19.6, 0.2);
const RbordertMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const Rborder = new THREE.Mesh( RborderGeometry, RbordertMaterial );
Rborder.translateX( 14.9 );
Rborder.translateZ( 0.1 );
Rborder.translateY( 0 );
scene.add( Rborder );

const SborderGeometry = new THREE.BoxGeometry(30, 0.2, 0.2);
const SbordertMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const Sborder = new THREE.Mesh( SborderGeometry, SbordertMaterial );
Sborder.translateX( 0 );
Sborder.translateZ( 0.1 );
Sborder.translateY( -9.9 );
scene.add( Sborder );

const NborderGeometry = new THREE.BoxGeometry(30, 0.2, 0.2);
const NbordertMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff } );
const Nborder = new THREE.Mesh( NborderGeometry, NbordertMaterial );
Nborder.translateX( 0 );
Nborder.translateZ( 0.1 );
Nborder.translateY( 9.9 );
scene.add( Nborder );

//-------------------axe------------------------------------------
const material = new THREE.LineBasicMaterial( { color: 0xffffff } );
const points = [];
points.push( new THREE.Vector3( 0, 10, 0 ) );
points.push( new THREE.Vector3( 0, -10, 0 ) );
const geometry = new THREE.BufferGeometry().setFromPoints( points );
const line = new THREE.Line( geometry, material );
scene.add( line );

//--------------------affichage---------------------------------------

camera.position.z = 15;
camera.position.y = -20;
camera.position.x = 0;
camera.rotateX(45);

function animate() {

	// sphere.rotation.x += 0.01;
	// sphere.rotation.y += 0.01;
queueMicrotask
	renderer.render( scene, camera );

}
