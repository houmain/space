import { GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Scenes } from './scenes';
import { PlayerHud } from '../view/playerHud';
import { Assets } from '../view/assets';

class PlanetInfoBox {

	private _container: Phaser.GameObjects.Container;

	public constructor(scene: Phaser.Scene) {

		this._container = scene.add.container(600, 200);

		let planetInfoBox = scene.add.sprite(0, 0, Assets.ATLAS.GAME_GUI, 'planetInfo.png');
		planetInfoBox.setOrigin(0, 0);
		planetInfoBox.setAlpha(0.25);

		let planet = scene.add.sprite(planetInfoBox.width / 2, 40, 'planet');
		planet.setScale(0.5);

		let planetName = scene.add.bitmapText(planetInfoBox.width / 2, 80, 'infoText', 'Planet #1');
		planetName.setOrigin(0.5);

		let maintainance = scene.add.bitmapText(planetInfoBox.width / 2, 140, 'infoText', 'maintainance', 16);
		maintainance.setOrigin(0.5);

		let productivity = scene.add.bitmapText(planetInfoBox.width / 2, 200, 'infoText', 'productivity', 16);
		productivity.setOrigin(0.5);

		this._container.add(planetInfoBox);
		this._container.add(planet);
		this._container.add(planetName);
		this._container.add(maintainance);
		this._container.add(productivity);

		for (let s = 0; s < 5; s++) {
			let star = scene.add.sprite(30 + s * 40, 180, Assets.ATLAS.GAME_GUI, s < 4 ? 'star_active.png' : 'star_inactive.png');
			this._container.add(star);
		}

		for (let s = 0; s < 5; s++) {
			let star = scene.add.sprite(30 + s * 40, 240, Assets.ATLAS.GAME_GUI, s < 2 ? 'star_active.png' : 'star_inactive.png');
			this._container.add(star);
		}

		this._container.setPosition(window.innerWidth - planetInfoBox.width - 20, window.innerHeight - planetInfoBox.height - 20);
	}

	public resize() {
		//this._container.setPosition(window.innerWidth - planetInfoBox.width - 20, window.innerHeight - planetInfoBox.height - 20);
	}
}

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _gameInfoHandler: GameInfoHandler;
	private _playerHud: PlayerHud;

	public constructor() {
		super(Scenes.HUD);
	}

	public init(data: any) {

		let gameState = data.gameState;

		this._player = gameState.player;
		this._galaxyDataHandler = data.galaxyDataHandler;
		this._gameInfoHandler = data.gameInfoHandler;
	}

	public create() {
		this._gameInfoHandler.create(this);

		this._playerHud = new PlayerHud();
		this._playerHud.create(this, this._galaxyDataHandler, this._player);

		new PlanetInfoBox(this);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		this._gameInfoHandler.update(timeSinceLastFrame);
	}

	private resize() {
		let cam = this.cameras.main;
		cam.setViewport(0, 0, window.innerWidth, window.innerHeight);
		cam.centerToBounds();

		//cam.zoom = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
	}
}