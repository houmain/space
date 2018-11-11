import { GalaxySpriteFactory } from './galaxySpriteFactory';
import { Planet, Fighter, Squadron } from '../data/galaxyModels';
import { Background } from './background';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { Map } from '../common/collections';
import { GameEventObserver, EventFighterCreated, GameEventType, EventFighterDestroyed, EventSquadronCreated, EventSquadronDestroyed } from '../logic/event/eventInterfaces';
import { DebugInfo } from '../common/debug';
import Prando from 'prando';
import { ArrayUtils, RandomNumberGenerator } from '../common/utils';

const LAYER_PLANETS = 0;
const LAYER_SQUADRONS = 1;
const LAYER_FIGHTER = 2;

export class SeedableRng implements RandomNumberGenerator {

	private _prando: Prando;

	public constructor(seed: string | number) {
		this._prando = new Prando(seed);

		this._prando.next()
	}

	public random(): number {
		return this._prando.next();
	}

	public next(min: number, max: number): number {
		return this._prando.next(min, max);
	}
}

export class GameSpriteBuilder {

	private _spriteFactory: GalaxySpriteFactory;

	public constructor(scene: Phaser.Scene) {
		this._spriteFactory = new GalaxySpriteFactory(scene);
	}

	public createSquadron(squadron: Squadron) {
		let sprite = this._spriteFactory.get('squadron.png');

		sprite.setPosition(squadron.x, squadron.y);
		sprite.setOrigin(0.5);
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
		sprite.setDepth(LAYER_FIGHTER);
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

		planet.sprite = this._scene.add.sprite(0, 0, 'PLANETS', planet.parent ? this.getNextPlanetTextureName() : 'sun');
		planet.sprite.setScale(scale);
		planet.sprite.setDepth(LAYER_PLANETS);
	}

	private getNextPlanetTextureName(): string {
		return this.planetTextures[this._currentPlanetTextureIndex++];
	}
}

export class GameSceneRenderer {

	private _scene: Phaser.Scene;
	private _gameSpriteBuilder: GameSpriteBuilder;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _planets: Map<Planet>;

	private _graphics: Phaser.GameObjects.Graphics;

	private _background: Background;

	public constructor(scene: Phaser.Scene,
		galaxyDataHandler: GalaxyDataHandler,
		gameEventObserver: GameEventObserver) {

		this._scene = scene;
		this._galaxyDataHandler = galaxyDataHandler;
		this._gameSpriteBuilder = new GameSpriteBuilder(scene);

		this._background = new Background(scene);
		this._background.create();

		this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000, alpha: 1 } });

		let gameSceneBuilder = new GameSceneBuilder(this._scene, this._galaxyDataHandler, this._gameSpriteBuilder);
		gameSceneBuilder.build(new SeedableRng(123));

		this._planets = this._galaxyDataHandler.planets;

		gameEventObserver.subscribe<EventFighterCreated>(GameEventType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		gameEventObserver.subscribe<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));

		gameEventObserver.subscribe<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, this.onSquadronCreated.bind(this));
		gameEventObserver.subscribe<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));
	}

	private onFighterCreated(event: EventFighterCreated) {
		DebugInfo.info('onFighterCreated: ' + event);
		this._gameSpriteBuilder.createFighter(event.fighter);
	}

	private onFighterDestroyed(event: EventFighterDestroyed) {

		let sprite = event.fighter.sprite;
		if (!sprite) {
			console.warn('no sprite');
		} else {
			this._gameSpriteBuilder.releaseFighter(event.fighter);
		}
	}

	private onSquadronCreated(event: EventSquadronCreated) {
		this._gameSpriteBuilder.createSquadron(event.squadron);
	}



	private onSquadronDestroyed(event: EventSquadronDestroyed) {
		let sprite = event.squadron.sprite;
		/*
				let color = 0x000000;
				if (event.squadron.faction) {
					color = event.squadron.faction.color;
				}

				let emitter0 = this._scene.add.particles('fighter').createEmitter({
					x: sprite.x,
					y: sprite.y,
					speed: { min: -80, max: 80 },
					angle: { min: 0, max: 360 },
					scale: { start: 5, end: 0 },
					blendMode: 'SCREEN',
					tint: [color],
					lifespan: 600
				});
				emitter0.explode(10, sprite.x, sprite.y);
		*/
		this._gameSpriteBuilder.releaseSquadron(event.squadron);
	}

	public render() {
		let planets = this._planets.list;

		const CIRCLE_RADIUS = 20;

		this._background.update();

		this._graphics.clear();

		planets.forEach(planet => {
			if (planet.faction) {
				this._graphics.lineStyle(4, planet.faction.color, 0.5);

				this._graphics.strokeCircle(
					planet.x,
					planet.y,
					CIRCLE_RADIUS
				);
			}
		});
	}
}