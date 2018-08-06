import { FactionInfo } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { States } from './states';

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;

	public constructor() {
		super(States.HUD);
	}

	public init(data: any) {
		//alert(JSON.stringify(data));

		let gameState = data.gameState;
		let gameLogic = data.gameLogic;

		//this._galaxy = gameState.galaxy;
		if (gameState) {
			this._player = gameState.player;
			this._galaxyDataHandler = data.galaxyDataHandler;
		}

	}

	public create() {


		//let info = this.add.text(10, 10, 'SPACE', { font: '48px Arial', fill: '#ffffff' });
		if (this._player) {
			let f = new FactionInfo();
			//	f.create(this, this._galaxyDataHandler, this._player);
		}

	}
}