export class Background {

	private _scene: Phaser.Scene;
	private _camera: Phaser.Cameras.Scene2D.Camera;

	private _starfield: Phaser.GameObjects.TileSprite;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
		this._camera = this._scene.cameras.main;
	}

	public create() {

		let numTiles = 2;
		let size = 1024;

		let background = this._scene.add.tileSprite(-1024, -1024, 2048, 2048, 'background');
		background.setOrigin(0, 0);
		background.setTint(0x555555);

		this._starfield = this._scene.add.tileSprite(-1024, -1024, 2048, 2048, 'starfield');
		this._starfield.setOrigin(0, 0);
	}

	public update() {
		let x, y;
		x = this._camera.scrollX * 0.1;
		y = this._camera.scrollY * 0.1;
		//	this._starfield.setPosition(x, y);
	}
}