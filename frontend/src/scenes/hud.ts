import { GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Scenes } from './scenes';
import { PlayerHud } from '../view/playerHud';

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