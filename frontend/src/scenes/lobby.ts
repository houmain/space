import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { ServerMessageQueue } from '../communication/messageHandler';
import { ServerMessageType, MessageGameJoined } from '../communication/communicationInterfaces';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { TextResources, Texts } from '../localization/textResources';
import { Assets } from '../view/assets';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { ClientMessageSender, SetupPlayerInfo } from '../communication/clientMessageSender';
import { DebugInfo } from '../common/debug';
import { GameState } from './createNewGame';
/*
class PlayerBox extends Phaser.GameObjects.Container {

	private _name: Phaser.GameObjects.BitmapText;
	private _avatar: Phaser.GameObjects.Sprite;

	public constructor(scene: Phaser.Scene, msg: MessagePlayerInfo, isLocalPlayer: boolean, onClick?: Function) {
		super(scene);

		let fontSize = 40;

		let box = new NinePatch(scene, 0, 0, 300, 300, 'infoBox', null, {
			top: 16,
			bottom: 16,
			left: 16,
			right: 16
		});
		box.setOrigin(0, 0);
		box.setAlpha(0.5);
		scene.add.existing(box);

		let nameLabel = scene.add.bitmapText(20, 200, 'font_8', TextResources.getText(Texts.PLAYER_SETTINGS.NAME) + ':', fontSize);
		this._name = scene.add.bitmapText(200, 200, 'font_8', msg.name, fontSize);
		let colorLabel = scene.add.bitmapText(20, 240, 'font_8', TextResources.getText(Texts.PLAYER_SETTINGS.COLOR) + ':', fontSize);

		this._avatar = scene.add.sprite(box.width - 100, 100, Assets.ATLAS.AVATARS, msg.avatar);

		this.add(box);
		this.add(nameLabel);
		this.add(this._name);
		this.add(colorLabel);
		this.add(this._avatar);

		if (isLocalPlayer) {
			let readyButton = scene.add.bitmapText(20, 280, 'font_8', 'READY', fontSize);
			readyButton.setInteractive();
			readyButton.on('pointerdown', () => {
				onClick();
			});
			this.add(readyButton);
		}
	}
}
*/
export class LobbyScene extends GuiScene {

	private _gameState: GameState = null;
	private _setupPlayerInfo: SetupPlayerInfo;
	private _serverMessageQueue: ServerMessageQueue

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

		//this._serverMessageQueue.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined.bind(this));
		//this._serverMessageQueue.subscribe<MessageGameJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));

		this.sendChatMessage('test');
		//this.sendGameSetup();
		//this.sendPlayerReady();
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

	public update() {
		this._serverMessageQueue.handleMessages();
	}
}
/*
export class LobbyScene2 extends GuiScene {

	private _serverMessageQueue: ServerMessageQueue;
	private _timeController: GameTimeController;
	private _clientMessageSender: ClientMessageSender;

	private _container: Phaser.GameObjects.Container;

	//private _readyButton: RoundButton;

	private _factionId: number;

	public constructor() {
		super(Scenes.LOBBY);
	}

	public init(data: any) {
		this._serverMessageQueue = data.serverMessageQueue;
		this._timeController = data.timeController;
		this._clientMessageSender = data.clientMessageSender;
		this._factionId = data.factionId;
	}

	public create() {
		super.create();

		this._container = this.add.container(0, 0);
		this._container.setPosition(window.innerWidth / 2, window.innerHeight / 2);
		
				this._readyButton = new RoundButton(this);
				this._readyButton.setPosition(100, 100);
				this._readyButton.onClick = () => {
					// send ready to server
					this._clientMessageSender.sendReady();
				};
		
this._serverMessageQueue.subscribe<MessagePlayerInfo>(ServerMessageType.PLAYER_INFO, this.onPlayerInfo.bind(this));
this._serverMessageQueue.subscribe<MessageStartGame>(ServerMessageType.PLAYER_READY, this.onPlayerReady.bind(this));
this._serverMessageQueue.subscribe<MessageStartGame>(ServerMessageType.START_GAME, this.onStartGame.bind(this));
	}
	private ctr = 0;
	private onPlayerInfo(msg: MessagePlayerInfo) {
	console.log('PlayerInforeceived' + msg.factionId);

	let box = new PlayerBox(this, msg, msg.factionId === this._factionId, () => {
		//this._clientMessageSender.sendReady();
	});
	this._container.add(box);

	box.setPosition(-600 + this.ctr * 400, -200);
	this.ctr++;
}

	private onPlayerReady(msg: MessagePlayerReady) {
	DebugInfo.info('Player ready ' + msg.factionId);
}

	private onStartGame(msg: MessageStartGame) {

	console.log('StartGame' + msg.event);

	// goto initgame
	this.startGame();
}

	private startGame() {
	let gameConfig: SpaceGameConfig = {
		url: 'ws://127.0.0.1:9995/',
		//gameId: 1
	};

	this.scene.start(Scenes.INIT_GAME, {
		gameConfig: gameConfig
	});
}

	public update() {
	this._serverMessageQueue.handleMessages();
}
}*/