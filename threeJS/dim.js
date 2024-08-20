export default class dimention {
	constructor() {
		//SPHERE
		this.sphereRayon = 6;

		//BOX
		this.areneX = 304;
		this.areneY = 204;
		this.areneZ = 10;

		this.LRightX = 5;
		this.LRightY = 50;
		this.LRightZ = 10;

		this.LLeftX = 5;
		this.LLeftY = 50;
		this.LLeftZ = 10;

		this.LRborderX = 2;
		this.LRborderY = this.areneY - (this.LRborderX * 2);
		this.LRborderZ = 2;

		this.NSborderX = this.areneX;
		this.NSborderY = 2;
		this.NSborderZ = 2;

	}
}
