import { LAYER_PLANETS } from '../gameSceneRenderer';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { GameSpriteBuilder } from './gameSpriteBuilder';
import { RandomNumberGenerator, ArrayUtils } from '../../common/utils';
import { Planet } from '../../data/galaxyModels';
import { Assets } from '../assets';

export class GameSceneBuilder {

	private _scene: Phaser.Scene;
	private _galaxyDataHandler: GalaxyDataHandler;
	private _gameSpriteBuilder: GameSpriteBuilder;

	private planetTextures: string[] = [
		'planet02',
		'planet03',
		'planet06',
		'planet07',
		'planet09',
		'planet10',
		'planet11',
		'planet13',
		'planet16',
		'planet17',
		'planet18',
		'planet19',
		'planet20',
		'planet21',
		'planet22',
	];
	private _currentPlanetTextureIndex = 0;

	public constructor(scene: Phaser.Scene, galaxyDataHandler: GalaxyDataHandler, gameSpriteBuilder: GameSpriteBuilder) {
		this._scene = scene;
		this._galaxyDataHandler = galaxyDataHandler;
		this._gameSpriteBuilder = gameSpriteBuilder;
	}

	public build(rng: RandomNumberGenerator) {

		this.planetTextures = ArrayUtils.shuffle(this.planetTextures, rng);

		let planets = this._galaxyDataHandler.planets.list;
		planets.forEach(planet => {
			this.createPlanet(planet, rng);

			let squadrons = planet.squadrons.list;
			squadrons.forEach(squadron => {
				this._gameSpriteBuilder.createSquadron(squadron);

				let fighters = squadron.fighters;
				fighters.forEach(fighter => {
					this._gameSpriteBuilder.createFighter(fighter);
				});
			});
		});

		let squadrons = this._galaxyDataHandler.movingSquadrons.list;
		squadrons.forEach(squadron => {
			this._gameSpriteBuilder.createSquadron(squadron);

			let fighters = squadron.fighters;
			fighters.forEach(fighter => {
				this._gameSpriteBuilder.createFighter(fighter);
			});
		});
	}

	// build planets
	private createPlanet(planet: Planet, rng: RandomNumberGenerator) {

		let isSun: boolean = false;
		let isPlanet: boolean = false;

		if (!planet.parent) {
			isSun = true;
		} else if (planet.parent && !planet.parent.parent) {
			isPlanet = true;
		}

		let scale = 1;
		if (isSun) {
			scale = 0.35;
		} else if (isPlanet) {
			scale = rng.next(0.25, 0.25);
		} else {
			scale = rng.next(0.15, 0.25);
		}

		planet.sprite = this._scene.add.sprite(0, 0, Assets.ATLAS.PLANETS, planet.parent ? this.getNextPlanetTextureName() : 'sun');
		planet.sprite.setScale(scale);
		planet.sprite.setDepth(LAYER_PLANETS);

		planet.overlayShadow = this._scene.add.sprite(0, 0, Assets.ATLAS.PLANETS, 'planet_overlay_shading');
		planet.overlayShadow.setScale(scale);
		planet.overlayShadow.setDepth(LAYER_PLANETS);
	}

	private getNextPlanetTextureName(): string {
		return this.planetTextures[this._currentPlanetTextureIndex++];
	}
}