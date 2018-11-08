import { GalaxySpriteFactory } from './galaxySpriteFactory';
import { Planet, Fighter, Squadron } from '../data/galaxyModels';
import { Background } from './background';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { Map } from '../common/collections';
import { GameEventObserver, EventFighterCreated, GameEventType, EventFighterDestroyed, EventSquadronCreated, EventSquadronDestroyed } from '../logic/event/eventInterfaces';
import { DebugInfo } from '../common/debug';

const LAYER_PLANETS = 0;
const LAYER_SQUADRONS = 1;
const LAYER_FIGHTER = 2;

export class GameSceneRenderer {



	private _scene: Phaser.Scene;
	private _spriteFactory: GalaxySpriteFactory;

	private _planets: Map<Planet>;

	private _graphics: Phaser.GameObjects.Graphics;

	private _background: Background;

	public constructor(scene: Phaser.Scene,
		galaxyDataHandler: GalaxyDataHandler,
		gameEventObserver: GameEventObserver) {

		this._scene = scene;
		this._spriteFactory = new GalaxySpriteFactory(scene);

		this._background = new Background(scene);
		this._background.create();

		this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xff0000, alpha: 1 } });

		this._planets = galaxyDataHandler.planets;

		let planets = this._planets.list;
		planets.forEach(planet => {
			this.createPlanet(planet);

			let squadrons = planet.squadrons.list;
			squadrons.forEach(squadron => {
				this.createSquadron(squadron);

				let fighters = squadron.fighters;
				fighters.forEach(fighter => {
					this.createFighter(fighter);
				});
			});
		});

		let squadrons = galaxyDataHandler.movingSquadrons.list;
		squadrons.forEach(squadron => {
			this.createSquadron(squadron);

			let fighters = squadron.fighters;
			fighters.forEach(fighter => {
				this.createFighter(fighter);
			});
		});

		gameEventObserver.subscribe<EventFighterCreated>(GameEventType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		gameEventObserver.subscribe<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));

		gameEventObserver.subscribe<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, this.onSquadronCreated.bind(this));
		gameEventObserver.subscribe<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));
	}

	private createPlanet(planet: Planet) {
		planet.sprite = this._scene.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
		planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
		planet.sprite.setDepth(LAYER_PLANETS);
	}

	private onFighterCreated(event: EventFighterCreated) {
		DebugInfo.info('onFighterCreated: ' + event);
		this.createFighter(event.fighter);
	}

	private createFighter(fighter: Fighter) {
		let squadron = fighter.squadron;

		let sprite = this._spriteFactory.get('fighter.png');
		sprite.setDepth(LAYER_FIGHTER);
		sprite.setVisible(true);
		if (squadron.faction) {
			sprite.setTint(squadron.faction.color);
		}

		fighter.sprite = sprite;
	}

	private onFighterDestroyed(event: EventFighterDestroyed) {

		let sprite = event.fighter.sprite;
		if (!sprite) {
			console.warn('no sprite');
		} else {
			this._spriteFactory.release(sprite);
		}
	}

	private onSquadronCreated(event: EventSquadronCreated) {
		this.createSquadron(event.squadron);
	}

	private createSquadron(squadron: Squadron) {
		let sprite = this._spriteFactory.get('squadron.png');

		sprite.setPosition(squadron.x, squadron.y);
		sprite.setOrigin(0.5);
		sprite.setVisible(true);
		sprite.setDepth(LAYER_SQUADRONS);

		if (squadron.faction) {
			sprite.setTint(squadron.faction.color);
		}

		squadron.sprite = sprite;
		DebugInfo.info('GameSceneRenderer createSquadron');
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
		this._spriteFactory.release(sprite);
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