import { GuiScene } from '../guiScene';
import { Scenes } from '../scenes';
import { ServerMessageQueue } from '../../communication/messageHandler';
import { ServerMessageType, MessageGameJoined, MessagePlayerSetupUpdated, MessageChatMessage, MessageGameSetupUpdated, MessageGameStarted, MessagePlayerJoined, PlanetInfo, FactionInfo, SquadronInfo } from '../../communication/serverMessages';
import { SetupPlayerInfo } from '../../communication/clientMessageSender';
import { DebugInfo } from '../../common/debug';
import { GameState } from '../../logic/data/gameState';
import { ChatMessage } from '../../communication/clientMessages';

export interface LobbyMessagesHandler {
	onGameJoined(msg: MessageGameJoined);
	onPlayerJoined(msg: MessagePlayerJoined);
	onChatMessageReceived(msg: ChatMessage);
	onGameSetupUpdated(msg: MessageGameSetupUpdated);
	onPlayerSetupUpdated(msg: MessagePlayerSetupUpdated);
	onGameStarted(msg: MessageGameStarted);
}

export interface BuildGameInfo {
	factions: FactionInfo[];
	planets: PlanetInfo[];
	movingSquadrons: SquadronInfo[];
}

export class LobbyScene extends GuiScene implements LobbyMessagesHandler {

	private _gameState: GameState = null;
	private _setupPlayerInfo: SetupPlayerInfo;
	private _serverMessageQueue: ServerMessageQueue;

	public constructor() {
		super(Scenes.LOBBY);
	}

	public init(data: any) {
		this._gameState = data.gameState;
		this._setupPlayerInfo = data.setupPlayerInfo;
		this._serverMessageQueue = this._gameState.serverMessageQueue;
	}

	public create() {
		super.create();

		this._serverMessageQueue.subscribe<MessageChatMessage>(ServerMessageType.CHAT_MESSAGE, this.onChatMessageReceived.bind(this));
		this._serverMessageQueue.subscribe<MessageGameSetupUpdated>(ServerMessageType.GAME_SETUP_UPDATED, this.onGameSetupUpdated.bind(this));
		this._serverMessageQueue.subscribe<MessagePlayerSetupUpdated>(ServerMessageType.PLAYER_SETUP_UPDATED, this.onPlayerSetupUpdated.bind(this));
		this._serverMessageQueue.subscribe<MessageGameStarted>(ServerMessageType.GAME_STARTED, this.onGameStarted.bind(this));

		this.time.delayedCall(100, () => {
			this.sendChatMessage('test');
		}, [], this);

		if (this._gameState.canSetupGame) {
			this.time.delayedCall(300, () => {

				this.sendGameSetup();
			}, [], this);
		}

		this.time.delayedCall(10000, () => {
			this.sendPlayerReady();
		}, [], this);
	}

	public onGameJoined(msg: MessageGameJoined) {
		throw new Error('Method not implemented.');
	}
	public onPlayerJoined(msg: MessagePlayerJoined) {
		throw new Error('Method not implemented.');
	}

	public onChatMessageReceived(msg: ChatMessage) {
		DebugInfo.info('Received: ' + JSON.stringify(msg));
	}

	public onGameSetupUpdated(msg: MessageGameSetupUpdated) {
		DebugInfo.info('Received: ' + JSON.stringify(msg));
	}

	public onPlayerSetupUpdated(msg: MessagePlayerSetupUpdated) {
		DebugInfo.info('Received: ' + JSON.stringify(msg));
	}

	public onGameStarted(msg: MessageGameStarted) {
		DebugInfo.info('Received: ' + 'Received: ' + JSON.stringify(msg));
		this.goToInitGame({
			factions: msg.factions,
			planets: msg.planets,
			movingSquadrons: msg.squadrons
		});
	}

	private sendChatMessage(message: string) {
		this._gameState.clientMessageSender.sendChatMessage(message);
	}

	private sendGameSetup() {
		this._gameState.clientMessageSender.setupGame({
			numFactions: 2,
			numPlanets: 5
		});
	}

	private sendPlayerReady() {
		this._setupPlayerInfo.ready = true;
		this._gameState.clientMessageSender.setupPlayer(this._setupPlayerInfo);
	}

	private goToInitGame(buildGameInfo: BuildGameInfo) {
		this.scene.start(Scenes.INIT_GAME, {
			gameState: this._gameState,
			buildGameInfo: buildGameInfo
		});
	}

	public update() {
		this._serverMessageQueue.handleMessages();
	}
}