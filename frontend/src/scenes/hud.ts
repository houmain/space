import { GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Scenes, GameSceneEvents } from './scenes';
import { PlayerHud } from '../view/playerHud';
import { Assets } from '../view/assets';
import { Planet } from '../data/galaxyModels';
import { PlanetInfoBox } from '../view/gui/planetInfoBox';
import { ImageButton } from '../view/gui/guiModels';
import { ObservableServerMessageHandler } from '../communication/messageHandler';

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _gameInfoHandler: GameInfoHandler;
	private _playerHud: PlayerHud;
	private _planetInfoBox: PlanetInfoBox;
	private _serverMessageObserver: ObservableServerMessageHandler;

	public constructor() {
		super(Scenes.HUD);
	}

	public init(data: any) {

		this._galaxyDataHandler = data.galaxyDataHandler;
		this._gameInfoHandler = data.gameInfoHandler;
		this._serverMessageObserver = data.serverMessageObserver;
		this._player = data.gameState.player;
	}

	public create() {
		this._gameInfoHandler.create(this);

		this._playerHud = new PlayerHud();
		this._playerHud.create(this, this._galaxyDataHandler, this._player);

		this._planetInfoBox = new PlanetInfoBox(this, this._serverMessageObserver);
		this.add.existing(this._planetInfoBox);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();

		let b = new ImageButton(this, window.innerWidth - 50, 50, Assets.ATLAS.HUD, 'menu_icon.png');
		b.onClick = () => {
			console.log('click');
		};
		b.setScale(1.5);

		this.add.existing(b);

		let gameScene = this.scene.get(Scenes.GAME);
		gameScene.events.on(GameSceneEvents.PLANET_SELECTION_CHANGED, this.planetSelectionChanged.bind(this));
	}

	private planetSelectionChanged(planets: Planet[]) {
		this._planetInfoBox.updatePlanetsList(planets);

		if (planets.length === 0) {
			this._planetInfoBox.setVisible(false);
			this._planetInfoBox.unsubscribeEvents();
		} else {
			this._planetInfoBox.setVisible(true);
			this._planetInfoBox.subscribeEvents();
		}
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		this._gameInfoHandler.update(timeSinceLastFrame);
	}

	private resize() {
		//	let cam = this.cameras.main;
		//	cam.setViewport(0, 0, window.innerWidth, window.innerHeight);
		//	cam.centerToBounds();

		let bounds = this._planetInfoBox.getBounds();
		this._planetInfoBox.setPosition(window.innerWidth - bounds.width - 10, window.innerHeight - bounds.height - 10);
	}
}