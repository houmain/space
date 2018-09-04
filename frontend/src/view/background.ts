export class Background {

	private _scene: Phaser.Scene;
	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public create() {

		let numTiles = 2;
		let size = 1024;

		let background = this._scene.add.tileSprite(-2048, -2048, 4096, 4096, 'background');
		background.setOrigin(0, 0);
		background.setTint(0x555555);

		let starfield = this._scene.add.tileSprite(-2048, -2048, 4096, 4096, 'starfield');
		starfield.setOrigin(0, 0);
	}
}