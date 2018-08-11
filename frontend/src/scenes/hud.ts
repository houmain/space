import { FactionInfo, GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { States } from './states';

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;
	private _gameInfoHandler: GameInfoHandler;

	public constructor() {
		super(States.HUD);
	}

	public init(data: any) {

		let gameState = data.gameState;
		let gameLogic = data.gameLogic;

		if (gameState) {
			this._player = gameState.player;
			this._galaxyDataHandler = data.galaxyDataHandler;
		}
		this._gameInfoHandler = data.gameInfoHandler;
	}

	public create() {

		//let info = this.add.text(100, 10, 'SPACE', { font: '48px Arial', fill: '#ffffff' });
		///this.add.text(100, 40, 'SPACE', { font: '48px Arial', fill: '#ffffff' });
		this._gameInfoHandler.create(this);

	}

	public update(timeElapsed: number) {
		this._gameInfoHandler.update(timeElapsed);
	}
}