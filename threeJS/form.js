import * as THREE from 'three';
import dim from './dim.js';
export default class Form {
    constructor() {
        const dimension = new dim();
        //------------------sphere-----------------------------------------
        this.sphereGeometry = new THREE.SphereGeometry( dimension.sphereRayon, 320, 320);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('../texture/ball.jpg');
        this.sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
        this.sphere = new THREE.Mesh(this.sphereGeometry, this.sphereMaterial);
        this.sphere.position.set(-(dimension.areneX / 2 - dimension.LLeftX - dimension.sphereRayon), 0, dimension.sphereRayon);

        //--------------------arene------------------------------------------
        this.AreneGeomerty = new THREE.BoxGeometry(dimension.areneX, dimension.areneY, dimension.areneZ);
        const ArenetextureLoader = new THREE.TextureLoader();
        const Arenetexture = ArenetextureLoader.load('../texture/black-hole.jpg');
        this.AreneMaterial = new THREE.MeshBasicMaterial({ map: Arenetexture });
        this.Arene = new THREE.Mesh(this.AreneGeomerty, this.AreneMaterial);
        this.Arene.position.set(0, 0, -dimension.areneZ / 2);


        //--------------------line right---------------------------------------
        this.LRightGeometry = new THREE.BoxGeometry(dimension.LRightX, dimension.LRightY, dimension.LRightZ);
        this.LRightMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b1 });
        this.LRight = new THREE.Mesh(this.LRightGeometry, this.LRightMaterial);
        this.LRight.position.set(dimension.areneX / 2 - dimension.LRightX, 0, dimension.LRightZ / 2);

        //--------------------line left---------------------------------------
        this.LLeftGeometry = new THREE.BoxGeometry(dimension.LLeftX, dimension.LLeftY, dimension.LLeftZ);
        this.LLeftMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b1 });
        this.LLeft = new THREE.Mesh(this.LLeftGeometry, this.LLeftMaterial);
        this.LLeft.position.set(-(dimension.areneX / 2 - dimension.LLeftX), 0, dimension.LLeftZ / 2);

        //-------------------bordure------------------------------------------
        this.LborderGeometry = new THREE.BoxGeometry(dimension.LRborderX, dimension.LRborderY, dimension.LRborderZ);
        this.LbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Lborder = new THREE.Mesh(this.LborderGeometry, this.LbordertMaterial);
        this.Lborder.position.set(-(dimension.areneX / 2 - dimension.LRborderX /2), 0, dimension.LRborderZ /2);


        this.RborderGeometry = new THREE.BoxGeometry(dimension.LRborderX, dimension.LRborderY, dimension.LRborderZ);
        this.RbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Rborder = new THREE.Mesh(this.RborderGeometry, this.RbordertMaterial);
        this.Rborder.position.set(dimension.areneX / 2 - dimension.LRborderX /2, 0, dimension.LRborderZ /2);

        this.SborderGeometry = new THREE.BoxGeometry(dimension.NSborderX, dimension.NSborderY, dimension.NSborderZ);
        this.SbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.Sborder = new THREE.Mesh(this.SborderGeometry, this.SbordertMaterial);
        this.Sborder.position.set(0, -(dimension.areneY / 2 - dimension.NSborderY /2), dimension.NSborderZ /2);

        this.NborderGeometry = new THREE.BoxGeometry(dimension.NSborderX, dimension.NSborderY, dimension.NSborderZ);
        this.NbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.Nborder = new THREE.Mesh(this.NborderGeometry, this.NbordertMaterial);
        this.Nborder.position.set(0, dimension.areneY / 2 - dimension.NSborderY /2, dimension.NSborderZ / 2);


        //-------------------axe------------------------------------------
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.points = [];
        this.points.push(new THREE.Vector3(0, 100, 1));
        this.points.push(new THREE.Vector3(0, -100, 1));
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.line = new THREE.Line(this.geometry, this.material);
    }
}
