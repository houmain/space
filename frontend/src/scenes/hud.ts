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

		this._player = gameState.player;
		this._galaxyDataHandler = data.galaxyDataHandler;
		this._gameInfoHandler = data.gameInfoHandler;
	}

	public create() {
		this._gameInfoHandler.create(this);

		let factioInfo = new FactionInfo();
		factioInfo.create(this, this._galaxyDataHandler, this._player);

	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		this._gameInfoHandler.update(timeSinceLastFrame);
	}
}