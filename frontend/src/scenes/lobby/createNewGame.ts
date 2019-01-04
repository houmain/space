import { GuiHelper } from '../chooseGameType';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { Scenes } from '../scenes';
import { GuiScene } from '../guiScene';
import { GuiConfig } from '../../view/gui/guiConfig';
import { TextResources, Texts } from '../../localization/textResources';
import { Slider } from '../../view/gui/slider';
import { RoundButton } from '../../view/gui/roundButton';
import { ServerMessageQueue, ObservableServerMessageHandler } from '../../communication/messageHandler';
import { MessageGameJoined, ServerMessageType, MessagePlayerJoined } from '../../communication/serverMessages';
import { CommunicationHandler } from '../../communication/communicationInterfaces';
import { CommunicationHandlerMock } from '../../communication/mock/communicationHandlerMock';
import { CommunicationHandlerWebSocket, SpaceGameConfig } from '../../communication/communicationHandler';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { GameTimeController } from '../../logic/controller/gameTimeController';
import { DebugInfo } from '../../common/debug';
import { CookieHelper, GuidHelper } from '../../common/utils';
import { ClientMessageSender } from '../../communication/clientMessageSender';
import { GameEventObserver } from '../../logic/event/eventInterfaces';
import { Player } from '../../data/gameData';
import { GameEventObserverImpl } from '../../logic/event/gameEventObserver';

export class NewGameSettings {
	clientId: string;
	name: string;
	password: string;
	maxPlayers: number;
}

export class GameState {
	private readonly _serverMessageQueue: ServerMessageQueue;
	private readonly _timeController: GameTimeController;
	private readonly _clientMessageSender: ClientMessageSender;
	private _gameEventObserver: GameEventObserver = new GameEventObserverImpl();
	private readonly _galaxyDataHandler: GalaxyDataHandler = new GalaxyDataHandler();
	private readonly _player: Player = new Player();
	private _gameId: number;

	public constructor(clientMessageSender: ClientMessageSender, serverMessageQueue: ServerMessageQueue, timeController: GameTimeController) {
		this._clientMessageSender = clientMessageSender;
		this._serverMessageQueue = serverMessageQueue;
		this._timeController = timeController;
	}

	public get serverMessageQueue(): ServerMessageQueue {
		return this._serverMessageQueue;
	}

	public get timeController(): GameTimeController {
		return this._timeController;
	}

	public get clientMessageSender(): ClientMessageSender {
		return this._clientMessageSender;
	}

	public get player(): Player {
		return this._player;
	}

	public get gameId(): number {
		return this._gameId;
	}

	public addGameInfo(gameId: number, playerId: number) {
		this._gameId = gameId;
		this._player.playerId = playerId;
	}

	public get galaxyDataHandler(): GalaxyDataHandler {
		return this._galaxyDataHandler;
	}

	public get gameEventObserver(): GameEventObserver {
		return this._gameEventObserver;
	}
}

export class CreateNewGameScene extends GuiScene {

	private _container: Phaser.GameObjects.Container = null;

	private _gameState: GameState = null;
	private _serverMessageQueue: ServerMessageQueue = new ServerMessageQueue();

	public constructor() {
		super(Scenes.CREATE_NEW_GAME);
	}

	public create() {
		super.create();

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

		this._container.add(box);

		let header = this.add.bitmapText(30, 30, GuiConfig.LABELS.HEADER_2.fontName, TextResources.getText(Texts.CREATE_NEW_GAME.TITLE), GuiConfig.LABELS.HEADER_2.fontSize);
		header.setOrigin(0, 0);
		this._container.add(header);

		let maxPlayers = new Slider(this, 30, 100, 'Max Players');
		this._container.add(maxPlayers);

		let createButton = new RoundButton(this);
		createButton.setPosition(800, 400);
		createButton.onClick = () => {
			this.createNewGame();
			createButton.disable();
		};
		this._container.add(createButton);

		this._container.setPosition(window.innerWidth / 2 - box.width / 2, window.innerHeight / 2 - box.height / 2);

		new GuiHelper().addMainMenuButton(this);
	}

	private createNewGame() {
		this.connectToServer(this.sendCreateGameMessage.bind(this));
	}

	private connectToServer(onConnected: Function) {
		DebugInfo.info('Connecting to server ....');

		let timeController = new GameTimeController();
		this._serverMessageQueue.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined.bind(this));
		this._serverMessageQueue.subscribe<MessageGameJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));

		let communicationHandler: CommunicationHandler;
		let serverMessageObserver = new ObservableServerMessageHandler(this._serverMessageQueue, timeController);
		let mockServer = false;
		if (mockServer) {
			console.warn('Launching mock communication handler');
			let galaxyDataHandler = new GalaxyDataHandler();
			communicationHandler = new CommunicationHandlerMock(serverMessageObserver, galaxyDataHandler);
		} else {
			communicationHandler = new CommunicationHandlerWebSocket(serverMessageObserver);
		}
		communicationHandler.onConnected = () => {
			DebugInfo.debug('Connected to server');
			onConnected();
		};
		communicationHandler.onDisconnected = () => {
			DebugInfo.error('Connection failed');
		};
		communicationHandler.connect({
			url: 'ws://127.0.0.1:9995/'
		});
		let clientMessageSender = new ClientMessageSender(communicationHandler);
		this._gameState = new GameState(clientMessageSender, this._serverMessageQueue, timeController);
	}

	private sendCreateGameMessage() {
		DebugInfo.info('Create game message');

		const CLIENT_ID_COOKIE = 'clientId';

		let clientId = CookieHelper.getCookie(CLIENT_ID_COOKIE);
		if (!clientId) {
			clientId = GuidHelper.newGuid();
			CookieHelper.setCookie(CLIENT_ID_COOKIE, clientId, 365);
		}

		this._gameState.clientMessageSender.createGame({
			clientId: clientId,
			name: 'Testsession ' + ++this._gameCounter,
			password: '',
			maxPlayers: 4
		});
	}

	private _gameCounter: number = 0;

	public onGameJoined(msg: MessageGameJoined) {
		// go to next scene
		DebugInfo.info(JSON.stringify(msg));

		this._gameState.addGameInfo(msg.gameId, msg.playerId);

		this.scene.start(Scenes.CHOOSE_FACTION, {
			gameState: this._gameState
		});
	}

	public onPlayerJoined(msg: MessagePlayerJoined) {
		DebugInfo.info(JSON.stringify(msg));
	}

	public update() {
		this._serverMessageQueue.handleMessages();
	}
}