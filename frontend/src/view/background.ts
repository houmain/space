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
				let s = this._scene.add.sprite(-512 + x * 1024, -512 + y * 1024, 'background');
				s.setScale(1, 1);
			}
		}
	}
}