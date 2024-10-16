import * as THREE from 'three';

export default class Form {
    constructor() {
      this.ballRayon = 6;
      this.arene_size = [304, 229, 10];
      this.paddle_left_size = [5, 40, 10];
      this.paddle_right_size = [5, 40, 10];
      this.paddle_pos = 140;
      this.LRborder_size = [2, 225, 2];
      this.NSborder_size = [304, 2, 2];

        //------------------ball-----------------------------------------
        const ballGeometry = new THREE.SphereGeometry(this.ballRayon, 30, 30);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('texture/ball.jpg');
        const ballMaterial = new THREE.MeshBasicMaterial({ map: texture });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);

        this.ball.position.set(-(this.paddle_pos - this.ballRayon - (this.paddle_right_size[0] / 2)), 0, this.ballRayon);

        //--------------------arene------------------------------------------
        const AreneGeomerty = new THREE.BoxGeometry(this.arene_size[0], this.arene_size[1], this.arene_size[2]);
        const ArenetextureLoader = new THREE.TextureLoader();
        const Arenetexture = ArenetextureLoader.load('texture/black-hole.jpg');
        const AreneMaterial = new THREE.MeshBasicMaterial({ map: Arenetexture });
        this.Arene = new THREE.Mesh(AreneGeomerty, AreneMaterial);
        this.Arene.position.set(0, 0, -this.arene_size[2] / 2);

        //--------------------paddle right---------------------------------------
        const paddleRightGeometry = new THREE.BoxGeometry(this.paddle_right_size[0], this.paddle_right_size[1], this.paddle_right_size[2]);
        const paddleRightMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.paddleRight = new THREE.Mesh(paddleRightGeometry, paddleRightMaterial);
        this.paddleRight.position.set(this.paddle_pos, 0, this.paddle_right_size[2] / 2);

        //--------------------paddle left---------------------------------------
        const paddleLeftGeometry = new THREE.BoxGeometry(this.paddle_left_size[0], this.paddle_left_size[1], this.paddle_left_size[2]);
        const paddleLeftMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        this.paddleLeft = new THREE.Mesh(paddleLeftGeometry, paddleLeftMaterial);
        this.paddleLeft.position.set(-this.paddle_pos, 0, this.paddle_left_size[2] / 2);

        //-------------------bordure------------------------------------------
        const LborderGeometry = new THREE.BoxGeometry(this.LRborder_size[0], this.LRborder_size[1], this.LRborder_size[2]);
        const LbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Lborder = new THREE.Mesh(LborderGeometry, LbordertMaterial);
        this.Lborder.position.set(-(this.arene_size[0] / 2 - this.LRborder_size[0] /2), 0, this.LRborder_size[2] / 2);


        const RborderGeometry = new THREE.BoxGeometry(this.LRborder_size[0], this.LRborder_size[1], this.LRborder_size[2]);
        const RbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        this.Rborder = new THREE.Mesh(RborderGeometry, RbordertMaterial);
        this.Rborder.position.set(this.arene_size[0] / 2 - this.LRborder_size[0] /2, 0, this.LRborder_size[2] / 2);

        const SborderGeometry = new THREE.BoxGeometry(this.NSborder_size[0], this.NSborder_size[1], this.NSborder_size[2]);
        const SbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
        this.Sborder = new THREE.Mesh(SborderGeometry, SbordertMaterial);
        this.Sborder.position.set(0, -(this.arene_size[1] / 2 - this.NSborder_size[1] /2), this.NSborder_size[2] /2);

        const NborderGeometry = new THREE.BoxGeometry(this.NSborder_size[0], this.NSborder_size[1], this.NSborder_size[2]);
        const NbordertMaterial = new THREE.MeshBasicMaterial({ color: 0xe8e8e8 });
        this.Nborder = new THREE.Mesh(NborderGeometry, NbordertMaterial);
        this.Nborder.position.set(0, this.arene_size[1] / 2 - this.NSborder_size[1] /2, this.NSborder_size[2] / 2);


        //-------------------axe------------------------------------------
        const material = new THREE.LineBasicMaterial({ color: 0x000000 });
        this. points = [];
        this.points.push(new THREE.Vector3(0, this.arene_size[1] / 2, 1));
        this.points.push(new THREE.Vector3(0, -(this.arene_size[1] /2), 1));
        const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.line = new THREE.Line(geometry, material);
    }
}
