import { Scenes } from './scenes';
import { InputHandler } from '../input/selectionHandler';
import { GameTimeHandler } from '../logic/gameTimeHandler';
import { ClientMessageSender } from '../communication/communicationHandler';
import { Galaxy, Squadron, Fighter } from '../data/galaxyModels';
import { Background } from '../view/background';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { EventFighterCreated, GameEventObserver, GameEventType, EventFighterDestroyed, EventSquadronDestroyed, EventSquadronCreated } from '../logic/eventInterfaces';
import { Player } from '../data/gameData';

/*
TODO:

TASKS:
- added rendering code from GameScene to game renderer
- remove squadrons from galaxy
- add optional initial size for pools

BUGS:
- new squadrons are not rendered
- sent fighters are not updated until the new squadron arrived
- squadrons are not in the center of a planet
*/

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
		sprite.setActive(false);
		sprite.setVisible(false);
	}
}

export class GameScene extends Phaser.Scene {

	private _camera: Phaser.Cameras.Scene2D.Camera;

	private _galaxy: Galaxy;
	private _player: Player;

	private _inputHandler: InputHandler;
	private _timeHandler: GameTimeHandler;
	private _clientMessageSender: ClientMessageSender;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _gameEventObserver: GameEventObserver;

	private _graphics: Phaser.GameObjects.Graphics;

	private _background: Background;

	private _spriteFactory: GalaxySpriteFactory;

	public constructor() {
		super(Scenes.GAME);
	}

	public init(data: any) {

		this._clientMessageSender = data.clientMessageSender;
		this._serverMessageObserver = data.serverMessageObserver;
		this._gameEventObserver = data.gameEventObserver;

		let gameState = data.gameState;

		this._galaxy = gameState.galaxy;
		this._player = gameState.player;
	}

	public create() {

		this._spriteFactory = new GalaxySpriteFactory(this);

		this._timeHandler = new GameTimeHandler(this._serverMessageObserver);

		this._camera = this.cameras.main;
		this._camera.setBounds(-1024, -1024, 2048, 2048);
		this._camera.centerToBounds();

		this._background = new Background(this);
		this._background.create();

		this._galaxy.planets.forEach(planet => {
			planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
			planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
		});

		this._galaxy.squadrons.forEach(squadron => {
			this.createSquadronSprite(squadron);

			squadron.fighters.forEach(fighter => {
				this.createFighterSprite(fighter);
			});
		});

		this._inputHandler = new InputHandler(this, this._player, this._galaxy.planets, this._clientMessageSender);
		this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000, alpha: 1 } });

		this._gameEventObserver.subscribe<EventFighterCreated>(GameEventType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		this._gameEventObserver.subscribe<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));

		this._gameEventObserver.subscribe<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, this.onSquadronCreated.bind(this));
		this._gameEventObserver.subscribe<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();

		this._camera.fadeIn(1000);
	}

	private onFighterCreated(event: EventFighterCreated) {
		this.createFighterSprite(event.fighter);
	}

	private createFighterSprite(fighter: Fighter) {
		let squadron = fighter.squadron;

		fighter.sprite = this._spriteFactory.get('fighter');
		fighter.sprite.setScale(3);
		fighter.sprite.setPosition(fighter.x, fighter.y);
		if (squadron.faction) {
			fighter.sprite.setTint(squadron.faction.color);
		}
	}

	private onFighterDestroyed(event: EventFighterDestroyed) {
		let sprite = event.fighter.sprite;
		this._spriteFactory.release(sprite);
	}

	private onSquadronCreated(event: EventSquadronCreated) {
		this.createSquadronSprite(event.squadron);
	}

	private createSquadronSprite(squadron: Squadron) {
		squadron.sprite = this._spriteFactory.get('squadron');
		squadron.sprite.setPosition(squadron.x, squadron.y);
		squadron.sprite.setScale(10);
		if (squadron.faction) {
			squadron.sprite.setTint(squadron.faction.color);
		}
	}

	private onSquadronDestroyed(event: EventSquadronDestroyed) {
		let sprite = event.squadron.sprite;
		this._spriteFactory.release(sprite);
	}

	private resize() {
		this._camera.setViewport(0, 0, window.innerWidth, window.innerHeight);
		this._camera.zoom = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
		this._camera.centerToBounds();
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {

		let ANGULAR_VELOCITY = 0.0025;

		let FIGHTER_VELOCITY = 0.1;

		let speed = FIGHTER_VELOCITY * timeSinceLastFrame;

		this._timeHandler.addLocalElapsedTime(timeSinceLastFrame);
		let timeElapsed = this._timeHandler.timeSinceStart;

		this._background.update();

		this._galaxy.planets.forEach(planet => {
			let angle = planet.initialAngle + planet.angularVelocity * timeElapsed;
			planet.x = Math.cos(angle) * planet.distance;
			planet.y = Math.sin(angle) * planet.distance;
			if (planet.parent) {
				planet.x += planet.parent.x;
				planet.y += planet.parent.y;
			}

			planet.sprite.x = planet.x;
			planet.sprite.y = planet.y;

			let squadrons: Squadron[] = planet.squadrons;

			squadrons.forEach(squadron => {

				let planet = squadron.planet;
				let targetX = planet.x;
				let targetY = planet.y;

				let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - squadron.x, targetY - squadron.y);

				range = range.normalize().scale(speed);

				squadron.x += range.x;
				squadron.y += range.y;

				squadron.sprite.x = squadron.x;
				squadron.sprite.y = squadron.y;

				squadron.fighters.forEach(fighter => {
					this.updateFighter(fighter, timeSinceLastFrame);
				});
			});
		});

		this._graphics.clear();

		this._galaxy.planets.forEach(planet => {
			if (planet.faction) {
				this._graphics.lineStyle(4, planet.faction.color, 1);

				this._graphics.strokeCircle(
					planet.x,
					planet.y,
					30
				);
			}
		});

		this._inputHandler.update();
	}

	private updateFighter(fighter: Fighter, delta: number) {

		let ANGULAR_VELOCITY = 0.0025;
		let FIGHTER_VELOCITY = 0.1;

		fighter.orbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * delta;

		let targetX = fighter.squadron.x;
		let targetY = fighter.squadron.y;
		targetX += Math.cos(fighter.orbitingAngle) * fighter.orbitingDistance;
		targetY += Math.sin(fighter.orbitingAngle) * fighter.orbitingDistance;

		let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
		let speed = FIGHTER_VELOCITY * delta + (1 + Math.cos(fighter.orbitingAngle * 3)) / 8;

		if (range.length() > speed)
			range = range.normalize().scale(speed);

		fighter.x += range.x;
		fighter.y += range.y;

		if (fighter.sprite) {
			fighter.sprite.x = fighter.x;
			fighter.sprite.y = fighter.y;
		}


		let newOrbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * delta * 5;
		targetX = fighter.squadron.x + Math.cos(newOrbitingAngle) * fighter.orbitingDistance;
		targetY = fighter.squadron.y + Math.sin(newOrbitingAngle) * fighter.orbitingDistance;

		range = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
	}

	public shutdown() {
		this.sys.game.events.off('resize', this.resize, this, true);
	}
}