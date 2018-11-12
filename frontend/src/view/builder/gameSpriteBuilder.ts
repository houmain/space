import { Fighter, Squadron } from '../../data/galaxyModels';
import { GalaxySpriteFactory } from '../galaxySpriteFactory';
import { LAYER_SQUADRONS, LAYER_FIGHTERS } from '../gameSceneRenderer';

export class GameSpriteBuilder {

	private _spriteFactory: GalaxySpriteFactory;

	public constructor(scene: Phaser.Scene) {
		this._spriteFactory = new GalaxySpriteFactory(scene);
	}

	public createSquadron(squadron: Squadron) {
		let sprite = this._spriteFactory.get('squadron.png');

		sprite.setPosition(squadron.x, squadron.y);
		sprite.setOrigin(0.5);
		sprite.setAlpha(0.2);
		sprite.setVisible(true);
		sprite.setDepth(LAYER_SQUADRONS);

		if (squadron.faction) {
			sprite.setTint(squadron.faction.color);
		}

		squadron.sprite = sprite;
	}

	public releaseSquadron(squadron: Squadron) {
		this._spriteFactory.release(squadron.sprite);
	}

	public createFighter(fighter: Fighter) {
		let squadron = fighter.squadron;

		let sprite = this._spriteFactory.get('fighter.png');
		sprite.setDepth(LAYER_FIGHTERS);
		sprite.setVisible(true);
		if (squadron.faction) {
			sprite.setTint(squadron.faction.color);
		}

		fighter.sprite = sprite;
	}

	public releaseFighter(fighter: Fighter) {
		this._spriteFactory.release(fighter.sprite);
	}
}