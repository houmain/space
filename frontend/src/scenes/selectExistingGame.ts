import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { TextResources, Texts } from '../localization/textResources';
import { SpaceGameConfig, CommunicationHandlerWebSocket } from '../communication/communicationHandler';
import { CommunicationHandler, ServerMessageType, MessagePlayerJoined } from '../communication/communicationInterfaces';
import { DebugInfo } from '../common/debug';
import { ClientMessageSender } from '../communication/clientMessageSender';
import { ObservableServerMessageHandler, ServerMessageQueue } from '../communication/messageHandler';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { CommunicationHandlerMock } from '../communication/mock/communicationHandlerMock';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { GuiFactory } from '../view/gui/guiFactory';
import { Inputfield } from '../view/gui/text/inputField';
import { GuiConfig } from '../view/gui/guiConfig';

export class SelectExistingGameScene extends GuiScene {

	private _container: Phaser.GameObjects.Container;
	private _server: Inputfield;

	private _gameSessions: Phaser.GameObjects.BitmapText[];

	private _communicationHandler: CommunicationHandler;
	private _clientMessageSender: ClientMessageSender;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _serverMessageQueue: ServerMessageQueue;
	private _timeController: GameTimeController;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _factionId: number;
	private _gameId: number;

	public constructor() {
		super(Scenes.SELECT_EXISTING_GAME);
	}

	public create() {
		super.create();

		this._container = this.add.container(0, 0);

		let box = GuiFactory.buildBox(this, 0, 0, GuiConfig.SELECT_SESSION_BOX);
		let serverLabel = GuiFactory.buildBitmapText(this, 40, 100, TextResources.getText(Texts.COMMON.SERVER), GuiConfig.GUI_HEADER);
		this._server = new Inputfield(this, 240, 100, 'ws://127.0.0.1:9995/');
		let connectButton = GuiFactory.buildTextButton(this, 810, 100, TextResources.getText(Texts.SELECT_GAME.CONNECT), GuiConfig.TEXT_BUTTON);
		connectButton.onClickListener = () => {
			this._server.blur();
			this.connectToServer();
		};
		let gameSessionsLabel = GuiFactory.buildBitmapText(this, 40, 220, TextResources.getText(Texts.SELECT_GAME.SESSIONS), GuiConfig.GUI_HEADER);

		this._container.add(box);
		this._container.add(serverLabel);
		this._container.add(this._server);
		this._container.add(connectButton);
		this._container.add(gameSessionsLabel);
		this._container.setPosition(window.innerWidth / 2 - box.width / 2, window.innerHeight / 2 - box.height / 2);

		this._serverMessageQueue = new ServerMessageQueue();
		this._serverMessageObserver = new ObservableServerMessageHandler(this._serverMessageQueue, this._timeController);
		let mockServer = true;
		if (mockServer) {
			console.warn('Launching mock communication handler');
			this._galaxyDataHandler = new GalaxyDataHandler();
			this._communicationHandler = new CommunicationHandlerMock(this._serverMessageObserver, this._galaxyDataHandler);
		} else {
			this._communicationHandler = new CommunicationHandlerWebSocket(this._serverMessageObserver);
		}

		//	this._serverMessageQueue.subscribe<MessageAvailableGameSessions>(ServerMessageType.AVAILABLE_SESSIONS, this.onAvailableSessionsReceived.bind(this));
		this._serverMessageQueue.subscribe<MessagePlayerJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
		this._timeController = new GameTimeController();
	}

	private connectToServer() {
		let gameConfig: SpaceGameConfig = {
			url: this._server.text,
			//gameId: null
		};
		this._communicationHandler.connect(gameConfig);
		this._communicationHandler.onConnected = () => {
			DebugInfo.debug('Connected to server ' + this._server.text);

			this._clientMessageSender = new ClientMessageSender(this._communicationHandler);
			//	this._clientMessageSender.getAvailableGameSessions();

			//this._clientMessageSender.joinGame(this._gameConfig.gameId);
		};
	}
	/*
		private onAvailableSessionsReceived(msg: MessageAvailableGameSessions) {
			console.log('received' + msg.sessions.length);
	
			msg.sessions.forEach((session, index) => {
	
				// server
				let sessionName = GuiFactory.buildBitmapText(this, 250, 220 + index * 100, `${session.name} Players ${session.numPlayers}/${session.maxPlayers}`, GuiConfig.GUI_HEADER);
				this._container.add(sessionName);
	
				let joinButton = GuiFactory.buildTextButton(this, 800, 210 + index * 100, TextResources.getText(Texts.SELECT_GAME.JOIN), GuiConfig.TEXT_BUTTON);
				joinButton.onClickListener = () => {
					this.joinSession(session.gameId);
				};
				this._container.add(joinButton);
			});
		}
	*/
	private joinSession(gameId: number) {
		this._gameId = gameId;
		this._clientMessageSender.joinGame(gameId);
	}


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