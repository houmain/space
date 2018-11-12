import { GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { Scenes } from './scenes';
import { PlayerHud } from '../view/playerHud';
import { Assets } from '../view/assets';
import { Planet } from '../data/galaxyModels';
import { PlanetInfoBox } from '../view/gui/planetInfoBox';
import { ImageButton } from '../view/gui/guiModels';
import { GameEventObserver, SceneEvents } from '../logic/event/eventInterfaces';

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _gameInfoHandler: GameInfoHandler;
	private _playerHud: PlayerHud;
	private _planetInfoBox: PlanetInfoBox;
	private _gameEventObserver: GameEventObserver;

	public constructor() {
		super(Scenes.HUD);
	}

	public init(data: any) {

		this._gameInfoHandler = data.gameInfoHandler;
		this._gameEventObserver = data.gameEventObserver;
		this._player = data.player;
	}

	public create() {
		this._gameInfoHandler.create(this);

		this._playerHud = new PlayerHud();
		this._playerHud.create(this, this._gameEventObserver, this._player);

		this._planetInfoBox = new PlanetInfoBox(this, this._gameEventObserver, this._player.faction.id);
		this._planetInfoBox.setVisible(false);
		this.add.existing(this._planetInfoBox);

		this.sys.game.events.on(SceneEvents.RESIZE, this.resize, this);
		this.resize();

		let menuButton = new ImageButton(this, window.innerWidth - 50, 50, Assets.ATLAS.HUD, 'menu_icon.png');
		menuButton.onClick = () => {
			this.scene.stop(Scenes.GAME);
			this.scene.stop(Scenes.HUD);

			this.scene.start(Scenes.MAIN_MENU);
		};
		menuButton.setScale(1.5);

		this.add.existing(menuButton);

		let gameScene = this.scene.get(Scenes.GAME);
		gameScene.events.on(SceneEvents.PLANET_SELECTION_CHANGED, this.planetSelectionChanged.bind(this));
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