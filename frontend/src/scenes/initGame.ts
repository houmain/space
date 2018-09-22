import { Scenes } from './scenes';
import { GameLogic, GameEventObserverImpl } from '../logic/gameLogic';
import { GameState } from '../data/gameData';
import { SpaceGame } from '../Game';
import { Galaxy } from '../data/galaxyModels';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { ClientMessageSender, SpaceGameConfig, CommunicationHandlerWebSocket } from '../communication/communicationHandler';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { GameInfoHandler } from '../view/gameInfo';
import { Assets } from '../view/assets';
import { GuiScene } from './guiScene';
import { TextResources, Texts } from '../localization/textResources';
import { CommunicationHandler } from '../communication/communicationInterfaces';
import { CommunicationHandlerMock } from '../communication/mock/communicationHandlerMock';

export class InitGameScene extends GuiScene {

	private _game: SpaceGame;
	private _gameConfig: SpaceGameConfig;
	private _communicationHandler: CommunicationHandler;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _clientMessageSender: ClientMessageSender;
	private _gameEventObserver: GameEventObserverImpl;

	private _gameState: GameState;
	private _gameLogic: GameLogic;
	private _galaxyDataHandler: GalaxyDataHandler;
	private _gameInfoHandler: GameInfoHandler;

	private _assetsLoaded = false;

	private _infoText: Phaser.GameObjects.BitmapText;

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
		this.load.image('squadron', './images/pixel.png');
		this.load.image('fighter', './images/pixel.png');

		// Textureatlas
		this.load.atlas(Assets.ATLAS.HUD, './spritesheets/game_gui.png', './spritesheets/game_gui.json');

		// fonts
		this.load.bitmapFont('gameHudCounter', './fonts/font_counter_-export.png', './fonts/font_counter_-export.xml');
		this.load.bitmapFont('gameHudText', './fonts/font_hud_text-export.png', './fonts/font_hud_text-export.xml');
		this.load.bitmapFont('infoText', './fonts/neuropol_18-export.png', './fonts/neuropol_18-export.xml');
	}

	public create() {
		super.create();

		this._serverMessageObserver = new ObservableServerMessageHandler();
		this._galaxyDataHandler = new GalaxyDataHandler();

		let mockServer = false;
		if (mockServer) {
			console.warn('Launching mock communication handler');
			this._communicationHandler = new CommunicationHandlerMock(this._serverMessageObserver, this._galaxyDataHandler);
		} else {
			this._communicationHandler = new CommunicationHandlerWebSocket(this._serverMessageObserver);
		}

		this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

		this._communicationHandler.init(this._gameConfig);
		this._communicationHandler.onConnected = () => {
			console.log('Connected to server');
			this._clientMessageSender.joinGame(this._gameConfig.gameId);
		};
		this._communicationHandler.onDisconnected = this.onConnectionFailed.bind(this);

		this._gameState = {
			player: this._game.player,
			galaxy: new Galaxy()
		};

		this._gameEventObserver = new GameEventObserverImpl();

		this._gameLogic = new GameLogic(this._gameState, this._serverMessageObserver, this._galaxyDataHandler, this._gameEventObserver);
		this._gameInfoHandler = new GameInfoHandler(this._gameEventObserver);

		this._infoText = this.add.bitmapText(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'font_8', TextResources.getText(Texts.INITGAME_JOINING_GAME));
		this._infoText.setOrigin(0.5, 0.5);

		if (mockServer) {
			this._infoText.setText('*** DEMO *** \n' + this._infoText.text);
			this._infoText.setTint(0xffff00);
		}

		this._assetsLoaded = true;
	}

	private onConnectionFailed() {

		this._infoText.text = TextResources.getText(Texts.ERROR_CONNECTION_FAILED);
		this._infoText.setTint(0xff0000);
		this._infoText.setAlpha(0);

		this.tweens.add({
			targets: this._infoText,
			alpha: 1,
			ease: 'Power1',
			duration: 300,
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				this.scene.start(Scenes.MAIN_MENU);
			}
		});
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
			galaxyDataHandler: this._galaxyDataHandler,
			clientMessageSender: this._clientMessageSender,
			serverMessageObserver: this._serverMessageObserver,
			gameEventObserver: this._gameEventObserver
		});
		this.scene.start(Scenes.HUD, {
			gameState: this._gameState,
			gameInfoHandler: this._gameInfoHandler,
			galaxyDataHandler: this._galaxyDataHandler,
			gameEventObserver: this._gameEventObserver
		});
	}

	protected resize() {
		super.resize();
	}
}