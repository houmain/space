import { Assets } from './assets';

export class GalaxySpriteFactory {

	private _spritePool: Phaser.GameObjects.Group;

	public constructor(private scene: Phaser.Scene) {
		this._spritePool = scene.add.group({

		});
	}

	public get(key: string): Phaser.GameObjects.Sprite {
		//	let sprite: Phaser.GameObjects.Sprite = this._spritePool.get(0, 0, Assets.ATLAS.GAME, key);
		//	sprite.setFrame(key);
		//	sprite.setVisible(true);
		return this.scene.add.sprite(0, 0, Assets.ATLAS.GAME, key);
	}

	public release(sprite: Phaser.GameObjects.Sprite) {
		if (sprite) {
			sprite.destroy();
			//sprite.setActive(false);
			//sprite.setVisible(false);
			//sprite.setTint(0xffffff);
		} else {
			console.warn('cannot release sprite');
		}
	}
}