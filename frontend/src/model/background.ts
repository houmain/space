export class Background {

	private _scene: Phaser.Scene;
	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public create() {

		let numTiles = 2;
		let size = 1024;

		for (let x = 0; x < numTiles; x++) {
			for (let y = 0; y < numTiles; y++) {
				this._scene.add.sprite(x * 1024, y * 1024, 'background');
			}
		}
	}
}