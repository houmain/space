import { States } from './states';
import { GameLogic } from '../logic/gameLogic';
import { Player, GameState } from '../data/gameData';
import { SpaceGame } from '../Game';
import { Galaxy } from '../data/galaxyModels';
import { ServerMessageObserver } from '../communication/messageHandler';

export class InitGameScene extends Phaser.Scene {

	private _initialized = false;

	private _game: SpaceGame;
	private _serverMessageObserver: ServerMessageObserver;
	private _gameState: GameState;
	private _gameLogic: GameLogic;

	public constructor(game: SpaceGame, serverMessageObserver: ServerMessageObserver) {
		super(States.INIT_GAME);
		this._game = game;
		this._serverMessageObserver = serverMessageObserver;
	}

	public create() {

		this._gameState = {
			player: this._game.player,
			galaxy: new Galaxy()
		};

		this._gameLogic = new GameLogic(this._gameState, this._serverMessageObserver);

		this._initialized = true;
	}

	public update() {
		if (this._initialized) {
			this.startGame();
		}
	}

	private startGame() {

		this.scene.start(States.GAME, {
			gameState: this._gameState,
			gameLogic: this._gameLogic
		});
		this.scene.start(States.HUD);
	}
}