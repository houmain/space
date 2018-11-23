import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { ServerMessageQueue } from '../communication/messageHandler';
import { ServerMessageType, MessagePlayerJoined, MessageStartGame } from '../communication/communicationInterfaces';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { TextResources, Texts } from '../localization/textResources';
import { Assets } from '../view/assets';
import { RoundButton } from '../view/gui/roundButton';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { ClientMessageSender } from '../communication/clientMessageSender';

class PlayerBox extends Phaser.GameObjects.Container {

	private _name: Phaser.GameObjects.BitmapText;
	private _avatar: Phaser.GameObjects.Sprite;

	public constructor(scene: Phaser.Scene) {
		super(scene);

		let fontSize = 60;

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
		this._name = scene.add.bitmapText(200, 200, 'font_8', 'Berni', fontSize);
		let colorLabel = scene.add.bitmapText(20, 300, 'font_8', TextResources.getText(Texts.PLAYER_SETTINGS.COLOR) + ':', fontSize);

		this._avatar = scene.add.sprite(box.width - 100, 100, Assets.ATLAS.FACTIONS, 'faction01');

		this.add(box);
		this.add(nameLabel);
		this.add(this._name);
		this.add(colorLabel);
		this.add(this._avatar);
	}
}

export class LobbyScene extends GuiScene {

	private _serverMessageQueue: ServerMessageQueue;
	private _timeController: GameTimeController;
	private _clientMessageSender: ClientMessageSender;

	private _container: Phaser.GameObjects.Container;

	private _readyButton: RoundButton;

	public constructor() {
		super(Scenes.LOBBY);
	}

	public init(data: any) {
		this._serverMessageQueue = data.serverMessageQueue;
		this._timeController = data.timeController;
		this._clientMessageSender = data.clientMessageSender;
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

		this._serverMessageQueue.subscribe<MessagePlayerJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
		this._serverMessageQueue.subscribe<MessageStartGame>(ServerMessageType.START_GAME, this.onStartGame.bind(this));
	}

	private onPlayerJoined(msg: MessagePlayerJoined) {
		console.log('PlayerJoined' + msg.factionId);

		let box = new PlayerBox(this);
		this._container.add(box);
	}


	private onStartGame(msg: MessageStartGame) {

		console.log('StartGame' + msg.event);

		// goto initgame
		this.startGame();
	}

	private startGame() {
		let gameConfig: SpaceGameConfig = {
			url: 'ws://127.0.0.1:9995/',
			gameId: 1
		};

		this.scene.start(Scenes.INIT_GAME, {
			gameConfig: gameConfig
		});
	}

	public update() {
		this._serverMessageQueue.handleMessages();
	}
}