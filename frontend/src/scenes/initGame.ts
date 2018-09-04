import { Scenes } from './scenes';
import { GameLogic } from '../logic/gameLogic';
import { GameState } from '../data/gameData';
import { SpaceGame } from '../Game';
import { Galaxy } from '../data/galaxyModels';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { ClientMessageSender, CommunicationHandler, SpaceGameConfig } from '../communication/communicationHandler';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { GameInfoHandler } from '../view/gameInfo';
import { Assets } from '../view/assets';

export class InitGameScene extends Phaser.Scene {

	private _game: SpaceGame;
	private _gameConfig: SpaceGameConfig;
	private _communicationHandler: CommunicationHandler;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _clientMessageSender: ClientMessageSender;

	private _gameState: GameState;
	private _gameLogic: GameLogic;
	private _galaxyDataHandler: GalaxyDataHandler;
	private _gameInfoHandler: GameInfoHandler;

	private _assetsLoaded = false;

	public constructor(game: SpaceGame) {
		super(Scenes.INIT_GAME);
		this._game = game;
	}

	public init(data: any) {
		this._gameConfig = data.gameConfig;
	}

	public preload() {
		this.loadGameAssets();
	}

	private loadGameAssets() {
		this.load.setPath('./assets/');

		// Game
		this.load.image('background', './images/mainMenu.jpg');
		this.load.image('starfield', './images/starfield.png');
		this.load.image('planet', './images/planet_1.png');
		this.load.image('sun', './images/planet_13.png');
		this.load.image('pixel', './images/pixel.png');

		// Textureatlas
		this.load.atlas(Assets.ATLAS.GAME_GUI, './spritesheets/game_gui.png', './spritesheets/game_gui.json');

		// fonts
		this.load.bitmapFont('gameHudCounter', './fonts/font_counter_-export.png', './fonts/font_counter_-export.xml');
		this.load.bitmapFont('gameHudText', './fonts/font_hud_text-export.png', './fonts/font_hud_text-export.xml');
	}

	public create() {

		this._serverMessageObserver = new ObservableServerMessageHandler();
		this._communicationHandler = new CommunicationHandler(this._serverMessageObserver);
		this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

		this._communicationHandler.init(this._gameConfig);
		this._communicationHandler.onConnected = () => {
			console.log('Connected to server');
			this._clientMessageSender.joinGame(this._gameConfig.gameId);
		};

		this._gameState = {
			player: this._game.player,
			galaxy: new Galaxy()
		};

		this._galaxyDataHandler = new GalaxyDataHandler(this._serverMessageObserver);
		this._gameLogic = new GameLogic(this._gameState, this._serverMessageObserver, this._galaxyDataHandler);
		this._gameInfoHandler = new GameInfoHandler(this._galaxyDataHandler, this._serverMessageObserver);

		let info = this.add.text(10, 100, 'joining game', { font: '32px Arial', fill: '#ffffff' });

		this._assetsLoaded = true;
	}

	public update() {
		if (this._assetsLoaded && this.gameInitialized()) {
			this.startGame();
		}
	}

	private gameInitialized(): boolean {
		return this._gameState.galaxy.planets.length > 0;
	}

	private startGame() {
		this.scene.start(Scenes.GAME, {
			gameState: this._gameState,
			gameLogic: this._gameLogic,
			galaxyDataHandler: this._galaxyDataHandler,
			clientMessageSender: this._clientMessageSender,
			serverMessageObserver: this._serverMessageObserver
		});
		this.scene.start(Scenes.HUD, {
			gameState: this._gameState,
			gameInfoHandler: this._gameInfoHandler,
			galaxyDataHandler: this._galaxyDataHandler
		});
	}
}