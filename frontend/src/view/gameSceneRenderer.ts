import { Planet } from '../data/galaxyModels';
import { Background } from './background';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { Map } from '../common/collections';
import { GameEventObserver, EventFighterCreated, GameEventType, EventFighterDestroyed, EventSquadronCreated, EventSquadronDestroyed } from '../logic/event/eventInterfaces';
import { DebugInfo } from '../common/debug';
import { SeedableRng } from '../common/utils';
import { GameSpriteBuilder } from './builder/gameSpriteBuilder';
import { GameSceneBuilder } from './builder/gameSceneBuilder';

export const LAYER_PLANETS = 0;
export const LAYER_SQUADRONS = 1;
export const LAYER_FIGHTERS = 2;

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