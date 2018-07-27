import { States } from './states';
import { GameLogic } from '../logic/gameLogic';
import { Player, GameState } from '../data/gameData';
import { SpaceGame } from '../Game';
import { Galaxy } from '../data/galaxyModels';
import { ServerMessageObserver } from '../communication/messageHandler';
import { ClientMessageSender } from '../communication/communicationHandler';

export class InitGameScene extends Phaser.Scene {

	private _game: SpaceGame;

	private _serverMessageObserver: ServerMessageObserver;
	private _clientMessageSender: ClientMessageSender;

	private _gameState: GameState;
	private _gameLogic: GameLogic;

	public constructor(game: SpaceGame, clientMessageSender: ClientMessageSender, serverMessageObserver: ServerMessageObserver) {
		super(States.INIT_GAME);
		this._game = game;
		this._clientMessageSender = clientMessageSender;
		this._serverMessageObserver = serverMessageObserver;
	}

	public create() {

		this._gameState = {
			player: this._game.player,
			galaxy: new Galaxy()
		};

		this._gameLogic = new GameLogic(this._gameState, this._serverMessageObserver);

		this._clientMessageSender.joinGame(1);

		console.log('joining game');

		let info = this.add.text(10, 100, 'joining game', { font: '32px Arial', fill: '#ffffff' });
	}

	public update() {
		if (this.gameInitialized()) {
			console.log('starting game');
			this.startGame();
		}
	}

	private gameInitialized(): boolean {
		return this._gameState.galaxy.planets.length > 0;
	}

	private startGame() {
		this.scene.start(States.GAME, {
			gameState: this._gameState,
			gameLogic: this._gameLogic
		});
		this.scene.start(States.HUD);
	}
}