export class GalaxySpriteFactory {

	private _spritePool: Phaser.GameObjects.Group;

	public constructor(scene: Phaser.Scene) {
		this._spritePool = scene.add.group({
		});
	}

	public get(key: string): Phaser.GameObjects.Sprite {
		return this._spritePool.get(0, 0, key);
	}

	public release(sprite: Phaser.GameObjects.Sprite) {
		if (sprite) {
			sprite.setActive(false);
			sprite.setVisible(false);
			sprite.setTint(0xffffff);
		} else {
			console.warn('cannot release sprite');
		}
	}
}