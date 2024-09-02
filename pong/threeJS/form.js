import * as THREE from 'three';

export default class Form {
    constructor() {
      this.ballRayon = 6;
      this.arene_size = [304, 204, 10];
      this.paddle_size = [5, 40, 10];
      this.paddle_pos = 140;
      this.LRborder_size = [2, 200, 2];
      this.NSborder_size = [304, 2, 2];

        //------------------ball-----------------------------------------
        const ballGeometry = new THREE.SphereGeometry( this.ballRayon, 30, 30);
        // const textureLoader = new THREE.TextureLoader();
        // const texture = textureLoader.load('../../resources/texture/ball.jpg');
        // const ballMaterial = new THREE.MeshBasicMaterial({ map: texture });
        const ballMaterial = new THREE.MeshBasicMaterial({ color: 0x898989 });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);

        this.ball.position.set(-(this.paddle_pos - this.ballRayon - (this.paddle_size[0] / 2)), 0, this.ballRayon);

    //     //--------------------arene------------------------------------------
        const AreneGeomerty = new THREE.BoxGeometry(this.arene_size[0], this.arene_size[1], this.arene_size[2]);
        const AreneMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        this.Arene = new THREE.Mesh(AreneGeomerty, AreneMaterial);
        this.Arene.position.set(0, 0, -this.arene_size[2] / 2);

        //--------------------paddle right---------------------------------------
        const paddleRightGeometry = new THREE.BoxGeometry(this.paddle_size[0], this.paddle_size[1], this.paddle_size[2]);
        const paddleRightMaterial = new THREE.MeshBasicMaterial({ color: 0x343434 });
        this.paddleRight = new THREE.Mesh(paddleRightGeometry, paddleRightMaterial);
          // this.paddle_pos= this.arene_size[0] / 2 - this.paddleX -10;

        this.paddleRight.position.set(this.paddle_pos, 0, this.paddle_size[2] / 2);

        //--------------------paddle left---------------------------------------
        const paddleLeftGeometry = new THREE.BoxGeometry(this.paddle_size[0], this.paddle_size[1], this.paddle_size[2]);
        const paddleLeftMaterial = new THREE.MeshBasicMaterial({ color: 0x343434 });
        this.paddleLeft = new THREE.Mesh(paddleLeftGeometry, paddleLeftMaterial);
        // this.paddle_pos= -(this.arene_size[0] / 2 - this.paddleX -10);
        this.paddleLeft.position.set(-this.paddle_pos, 0, this.paddle_size[2] / 2);

        // //-------------------bordure------------------------------------------
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
        const material = new THREE.LineBasicMaterial({ color: 0xffffff });
        this. points = [];
        this.points.push(new THREE.Vector3(0, this.arene_size[1] / 2, 1));
        this.points.push(new THREE.Vector3(0, -(this.arene_size[1] /2), 1));
        const geometry = new THREE.BufferGeometry().setFromPoints(this.points);
        this.line = new THREE.Line(geometry, material);

        const PlaneGeometry = new THREE.PlaneGeometry(10000, 10000);
        const PlanMaterial = new THREE.MeshBasicMaterial({ color: 0xfeb47b });
        this.Plan = new THREE.Mesh(PlaneGeometry, PlanMaterial);
        this.Plan.position.z = -20;
    }
}
