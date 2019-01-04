import { GuiScene } from '../guiScene';
import { Scenes } from '../scenes';
import { TextResources, Texts } from '../../localization/textResources';
import { SpaceGameConfig, CommunicationHandlerWebSocket } from '../../communication/communicationHandler';
import { ServerMessageType, MessagePlayerJoined, MessageGameJoined, MessageGameList } from '../../communication/serverMessages';
import { CommunicationHandler } from '../../communication/communicationInterfaces';
import { DebugInfo } from '../../common/debug';
import { ClientMessageSender } from '../../communication/clientMessageSender';
import { ObservableServerMessageHandler, ServerMessageQueue } from '../../communication/messageHandler';
import { GameTimeController } from '../../logic/controller/gameTimeController';
import { CommunicationHandlerMock } from '../../communication/mock/communicationHandlerMock';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { GameState } from './createNewGame';
import { CookieHelper, GuidHelper } from '../../common/utils';

export class SelectExistingGameScene extends GuiScene {

	private _container: Phaser.GameObjects.Container = null;
	private _serverMessageQueue: ServerMessageQueue = new ServerMessageQueue();
	private _gameState: GameState = null;

	public constructor() {
		super(Scenes.SELECT_EXISTING_GAME);
	}

	public create() {
		super.create();

		this._container = this.add.container(0, 0);

		this.connectToServer(this.sendRequestGameListMessage.bind(this));
	}

	private connectToServer(onConnected: Function) {
		DebugInfo.info('Connecting to server ....');

		let timeController = new GameTimeController();
		this._serverMessageQueue.subscribe<MessageGameList>(ServerMessageType.GAME_LIST, this.onGameListReceived.bind(this));
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

	private sendRequestGameListMessage() {
		DebugInfo.info('Create RequestGameListMessage');

		this._gameState.clientMessageSender.requestGameList();
	}

	private onGameListReceived(msg: MessageGameList) {
		DebugInfo.info(JSON.stringify(msg));

		if (msg.games.length > 0) {
			this.joinGame(msg.games[0].gameId);
		}
	}

	private joinGame(gameId: number) {

		const CLIENT_ID_COOKIE = 'clientId';

		let clientId = CookieHelper.getCookie(CLIENT_ID_COOKIE);
		if (!clientId) {
			clientId = GuidHelper.newGuid();
			CookieHelper.setCookie(CLIENT_ID_COOKIE, clientId, 365);
		}

		this._gameState.clientMessageSender.joinGame(gameId, clientId, '');
	}

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