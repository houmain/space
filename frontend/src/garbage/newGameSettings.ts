import { GuiScene } from '../scenes/guiScene';
import { Scenes } from '../scenes/scenes';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { RoundButton } from '../view/gui/roundButton';
import { ServerMessageType, MessagePlayerJoined } from '../communication/serverMessages';
import { CommunicationHandler } from "../communication/communicationInterfaces";
import { CommunicationHandlerMock } from '../communication/mock/communicationHandlerMock';
import { CommunicationHandlerWebSocket, SpaceGameConfig } from '../communication/communicationHandler';
import { ClientMessageSender } from '../communication/clientMessageSender';
import { DebugInfo } from '../common/debug';
import { ObservableServerMessageHandler, ServerMessageQueue } from '../communication/messageHandler';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { Texts, TextResources } from '../localization/textResources';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { GuiHelper } from '../scenes/chooseGameType';

export class NewGameSettingsScene extends GuiScene { // todo remove

	private _container: Phaser.GameObjects.Container;

	private _server: Phaser.GameObjects.BitmapText;
	private _numPlanets: Phaser.GameObjects.BitmapText;
	private _numFactions: Phaser.GameObjects.BitmapText;

	private _communicationHandler: CommunicationHandler;
	private _clientMessageSender: ClientMessageSender;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _galaxyDataHandler: GalaxyDataHandler;
	private _serverMessageQueue: ServerMessageQueue;
	private _timeController: GameTimeController;

	public constructor() {
		super(Scenes.NEW_GAME_SETTINGS);
	}

	public create() {
		super.create();

		this._serverMessageQueue = new ServerMessageQueue();

		this._container = this.add.container(0, 0);

		let box = new NinePatch(this, 0, 0, 1200, 500, 'settingsBox', null, {
			top: 60,
			bottom: 30,
			left: 60,
			right: 124
		});
		box.setOrigin(0, 0);
		box.setAlpha(0.5);
		this.add.existing(box);

		let fontSize = 60;
		// server
		let serverLabel = this.add.bitmapText(40, 100, 'font_8', TextResources.getText(Texts.COMMON.SERVER), fontSize);
		this._server = this.add.bitmapText(510, 100, 'font_8', 'ws://127.0.0.1:9995/', fontSize);
		let numPlanetsLabel = this.add.bitmapText(40, 150, 'font_8', TextResources.getText(Texts.NEW_GAME_SETTINGS.NUM_PLANETS), fontSize);
		this._numPlanets = this.add.bitmapText(510, 150, 'font_8', '3', fontSize);
		let numFactionsLabel = this.add.bitmapText(40, 200, 'font_8', TextResources.getText(Texts.NEW_GAME_SETTINGS.NUM_FACTIONS), fontSize);
		this._numFactions = this.add.bitmapText(510, 200, 'font_8', '3', fontSize);

		let createButton = new RoundButton(this);
		createButton.setPosition(box.width - 150, 400);
		createButton.onClick = () => {

			// create communicationHandler
			//this._serverMessageQueue.subscribe<MessageGameCreated>(ServerMessageType.GAME_CREATED, this.onGameCreated.bind(this));
			this._serverMessageQueue.subscribe<MessagePlayerJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
			this._timeController = new GameTimeController();
			this._serverMessageObserver = new ObservableServerMessageHandler(this._serverMessageQueue, this._timeController);
			this._galaxyDataHandler = new GalaxyDataHandler();

			let mockServer = true;
			if (mockServer) {
				console.warn('Launching mock communication handler');
				this._communicationHandler = new CommunicationHandlerMock(this._serverMessageObserver, this._galaxyDataHandler);
			} else {
				this._communicationHandler = new CommunicationHandlerWebSocket(this._serverMessageObserver);
			}

			this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

			let gameConfig: SpaceGameConfig = {
				url: this._server.text,
				//gameId: null
			};
			this._communicationHandler.connect(gameConfig);
			this._communicationHandler.onConnected = () => {
				DebugInfo.debug('Connected to server');

				/*		this._clientMessageSender.createGame({
							numFactions: Number(this._numFactions.text),
							numPlanets: Number(this._numPlanets.text)
						});*/
				//this._serverMessageObserver.subscribe<MessageGameCreated>(ServerMessageType.GAME_CREATED, this.onGameCreated.bind(this));

				//this._clientMessageSender.joinGame(this._gameConfig.gameId);
			};
			// on connect

			// create game

			// on success goto player settings page then lobby
		};

		this._container.add(box);
		this._container.add(serverLabel);
		this._container.add(this._server);
		this._container.add(numPlanetsLabel);
		this._container.add(this._numPlanets);
		this._container.add(numFactionsLabel);
		this._container.add(this._numFactions);
		this._container.add(createButton);

		this._container.setPosition(window.innerWidth / 2 - box.width / 2, window.innerHeight / 2 - box.height / 2);

		new GuiHelper().addMainMenuButton(this);
	}

	private _gameId: number;
	private _factionId: number;
	/*
		private onGameCreated(msg: MessageGameCreated) {
			console.log('GameCreated' + msg.gameId);
			this._gameId = msg.gameId;
	
			this._clientMessageSender.joinGame(msg.gameId);
		}*/

	private onPlayerJoined(msg: MessagePlayerJoined) {
		//	this._factionId = msg.factionId;

		this.goToPlayerSettingsScene();
	}

	private goToPlayerSettingsScene() {
		this.scene.start(Scenes.PLAYER_SETTINGS, {
			serverMessageQueue: this._serverMessageQueue,
			timeController: this._timeController,
			clientMessageSender: this._clientMessageSender,
			gameId: this._gameId,
			factionId: this._factionId
		});
	}

	public update() {
		this._serverMessageQueue.handleMessages();
	}
}