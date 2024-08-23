import * as THREE from 'three';
import val from './value.json';
export default class Form {
    constructor() {
        //------------------ball-----------------------------------------
        this.ballGeometry = new THREE.SphereGeometry( val.ballRayon, 15, 15);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('../texture/ball.jpg');
        this.ballMaterial = new THREE.MeshBasicMaterial({ map: texture });
        this.ball = new THREE.Mesh(this.ballGeometry, this.ballMaterial);

        this.ball.position.set(-(val.paddle_pos[0] - val.ballRayon - (val.paddle_size[0] / 2)), 0, val.ballRayon);

        //--------------------arene------------------------------------------
        this.AreneGeomerty = new THREE.BoxGeometry(val.arene_size[0], val.arene_size[1], val.arene_size[2]);
        const ArenetextureLoader = new THREE.TextureLoader();
        const Arenetexture = ArenetextureLoader.load('../texture/black-hole.jpg');
        this.AreneMaterial = new THREE.MeshBasicMaterial({ map: Arenetexture });
        this.Arene = new THREE.Mesh(this.AreneGeomerty, this.AreneMaterial);
        this.Arene.position.set(0, 0, -val.arene_size[2] / 2);

        //--------------------paddle right---------------------------------------
        this.paddleRightGeometry = new THREE.BoxGeometry(val.paddle_size[0], val.paddle_size[1], val.paddle_size[2]);
        this.paddleRightMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b1 });
        this.paddleRight = new THREE.Mesh(this.paddleRightGeometry, this.paddleRightMaterial);
          // val.paddle_pos[0]= val.arene_size[0] / 2 - val.paddleX -10;

        this.paddleRight.position.set(val.paddle_pos[0], val.paddle_pos[1], val.paddle_size[2] / 2);

        //--------------------paddle left---------------------------------------
        this.paddleLeftGeometry = new THREE.BoxGeometry(val.paddle_size[0], val.paddle_size[1], val.paddle_size[2]);
        this.paddleLeftMaterial = new THREE.MeshBasicMaterial({ color: 0xb5b2b1 });
        this.paddleLeft = new THREE.Mesh(this.paddleLeftGeometry, this.paddleLeftMaterial);
        // val.paddle_pos[0]= -(val.arene_size[0] / 2 - val.paddleX -10);
        this.paddleLeft.position.set(-val.paddle_pos[0], val.paddle_pos[1], val.paddle_size[2] / 2);

        // //-------------------bordure------------------------------------------
        this.LborderGeometry = new THREE.BoxGeometry(val.LRborder_size[0], val.LRborder_size[1], val.LRborder_size[2]);
        this.LbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Lborder = new THREE.Mesh(this.LborderGeometry, this.LbordertMaterial);
        this.Lborder.position.set(-(val.arene_size[0] / 2 - val.LRborder_size[0] /2), 0, val.LRborder_size[2] / 2);


        this.RborderGeometry = new THREE.BoxGeometry(val.LRborder_size[0], val.LRborder_size[1], val.LRborder_size[2]);
        this.RbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Rborder = new THREE.Mesh(this.RborderGeometry, this.RbordertMaterial);
        this.Rborder.position.set(val.arene_size[0] / 2 - val.LRborder_size[0] /2, 0, val.LRborder_size[2] / 2);

        this.SborderGeometry = new THREE.BoxGeometry(val.NSborder_size[0], val.NSborder_size[1], val.NSborder_size[2]);
        this.SbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.Sborder = new THREE.Mesh(this.SborderGeometry, this.SbordertMaterial);
        this.Sborder.position.set(0, -(val.arene_size[1] / 2 - val.NSborder_size[1] /2), val.NSborder_size[2] /2);

        this.NborderGeometry = new THREE.BoxGeometry(val.NSborder_size[0], val.NSborder_size[1], val.NSborder_size[2]);
        this.NbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.Nborder = new THREE.Mesh(this.NborderGeometry, this.NbordertMaterial);
        this.Nborder.position.set(0, val.arene_size[1] / 2 - val.NSborder_size[1] /2, val.NSborder_size[2] / 2);


        //-------------------axe------------------------------------------
        this.material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this.points = [];
        this.points.push(new THREE.Vector3(0, val.arene_size[1] / 2, 1));
        this.points.push(new THREE.Vector3(0, -(val.arene_size[1] /2), 1));
        this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.line = new THREE.Line(this.geometry, this.material);
    }
}
