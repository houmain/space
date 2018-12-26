import { Scenes } from './scenes';
import { GameLogicController } from '../logic/controller/gameLogicController';
import { SpaceGame } from '../Game';
import { ObservableServerMessageHandler, ServerMessageQueue } from '../communication/messageHandler';
import { SpaceGameConfig, CommunicationHandlerWebSocket } from '../communication/communicationHandler';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { GameInfoHandler } from '../view/gameInfo';
import { Assets } from '../view/assets';
import { GuiScene } from './guiScene';
import { TextResources, Texts } from '../localization/textResources';
import { CommunicationHandler } from '../communication/communicationInterfaces';
import { CommunicationHandlerMock } from '../communication/mock/communicationHandlerMock';
import { GameEventObserverImpl } from '../logic/event/gameEventObserver';
import { DebugInfo } from '../common/debug';
import { SceneEvents } from '../logic/event/eventInterfaces';
import { ClientMessageSender } from '../communication/clientMessageSender';
import { GameTimeController } from '../logic/controller/gameTimeController';

export class InitGameScene extends GuiScene {

	private _game: SpaceGame;
	private _gameConfig: SpaceGameConfig;
	private _communicationHandler: CommunicationHandler;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _clientMessageSender: ClientMessageSender;
	private _gameEventObserver: GameEventObserverImpl;
	private _serverMessageQueue: ServerMessageQueue;

	private _galaxyDataHandler: GalaxyDataHandler;
	private _gameInfoHandler: GameInfoHandler;
	private _timeController: GameTimeController;

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

		// Textureatlas
		this.load.atlas(Assets.ATLAS.HUD, './spritesheets/game_gui.png', './spritesheets/game_gui.json');
		this.load.atlas(Assets.ATLAS.GAME, './spritesheets/game.png', './spritesheets/game.json');
		this.load.atlas(Assets.ATLAS.PLANETS, './spritesheets/planets.png', './spritesheets/planets.json');
		this.load.atlas(Assets.ATLAS.FACTIONS, './spritesheets/factions.png', './spritesheets/factions.json');
		this.load.atlas(Assets.ATLAS.AVATARS, './spritesheets/avatars.png', './spritesheets/avatars.json');

		// fonts
		this.load.bitmapFont('gameHudCounter', './fonts/font_counter_-export.png', './fonts/font_counter_-export.xml');
		this.load.bitmapFont('gameHudText', './fonts/font_hud_text-export.png', './fonts/font_hud_text-export.xml');
		this.load.bitmapFont('infoText', './fonts/neuropol_18-export.png', './fonts/neuropol_18-export.xml');
		this.load.bitmapFont('gameInfo', './fonts/calibri_22-export.png', './fonts/calibri_22-export.xml');
	}

	public create() {
		super.create();

		this._serverMessageQueue = new ServerMessageQueue();
		this._timeController = new GameTimeController();
		this._serverMessageObserver = new ObservableServerMessageHandler(this._serverMessageQueue, this._timeController);
		this._galaxyDataHandler = new GalaxyDataHandler();

		let mockServer = false;
		if (mockServer) {
			console.warn('Launching mock communication handler');
			this._communicationHandler = new CommunicationHandlerMock(this._serverMessageObserver, this._galaxyDataHandler);
		} else {
			this._communicationHandler = new CommunicationHandlerWebSocket(this._serverMessageObserver);
		}

		this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

		this._communicationHandler.connect(this._gameConfig);
		this._communicationHandler.onConnected = () => {
			DebugInfo.debug('Connected to server');
			//	this._clientMessageSender.joinGame(this._gameConfig.gameId);
		};
		this._gameEventObserver = new GameEventObserverImpl();

		new GameLogicController(this._game.player, this._serverMessageObserver, this._galaxyDataHandler, this._gameEventObserver, this._serverMessageQueue);
		this._gameInfoHandler = new GameInfoHandler(this._game.player, this._gameEventObserver);

		this._infoText = this.add.bitmapText(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'font_8', TextResources.getText(Texts.INIT_GAME.JOINING_GAME));
		this._infoText.setOrigin(0.5, 0.5);

		if (mockServer) {
			this._infoText.setText('*** DEMO *** \n' + this._infoText.text);
			this._infoText.setTint(0xffff00);
		}

		this._assetsLoaded = true;

		this.sys.game.events.on(SceneEvents.DISCONNECTED, this.onDisconnected, this);
	}

	private onDisconnected() {

		this._infoText.text = TextResources.getText(Texts.ERROR.CONNECTION_FAILED);
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

		this._serverMessageQueue.handleMessages();

		if (this._assetsLoaded && this.gameInitialized()) {
			this.startGame();
		}
	}

	private gameInitialized(): boolean {
		return this._galaxyDataHandler.initialized;
	}

	private startGame() {

		this.scene.start(Scenes.GAME, {
			player: this._game.player,
			galaxyDataHandler: this._galaxyDataHandler,
			clientMessageSender: this._clientMessageSender,
			serverMessageObserver: this._serverMessageObserver,
			gameEventObserver: this._gameEventObserver,
			serverMessageQueue: this._serverMessageQueue,
			timeController: this._timeController
		});
		this.scene.start(Scenes.HUD, {
			player: this._game.player,
			gameInfoHandler: this._gameInfoHandler,
			gameEventObserver: this._gameEventObserver
		});
	}

	protected resize() {
		super.resize();
	}
}