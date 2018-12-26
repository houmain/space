import { GuiHelper } from './chooseGameType';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { Scenes } from './scenes';
import { GuiScene } from './guiScene';
import { GuiConfig } from '../view/gui/guiConfig';
import { TextResources, Texts } from '../localization/textResources';
import { Slider } from '../view/gui/slider';
import { RoundButton } from '../view/gui/roundButton';
import { ServerMessageQueue, ObservableServerMessageHandler } from '../communication/messageHandler';
import { CommunicationHandler } from '../communication/communicationInterfaces';
import { CommunicationHandlerMock } from '../communication/mock/communicationHandlerMock';
import { CommunicationHandlerWebSocket, SpaceGameConfig } from '../communication/communicationHandler';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { DebugInfo } from '../common/debug';
import { CookieHelper, GuidHelper } from '../common/utils';
import { ClientMessageSender } from '../communication/clientMessageSender';

export class NewGameSettings {
	clientId: string;
	name: string;
	password: string;
	maxPlayers: number;
}

export class CreateNewGameScene extends GuiScene {

	private _container: Phaser.GameObjects.Container;

	private _serverMessageQueue: ServerMessageQueue;
	private _clientMessageSender: ClientMessageSender;

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
		};
		this._container.add(createButton);

		this._container.setPosition(window.innerWidth / 2 - box.width / 2, window.innerHeight / 2 - box.height / 2);

		new GuiHelper().addMainMenuButton(this);
	}

	private createNewGame() {
		// todo: move to separate class

		// connect to server
		this.connectToServer(this.sendCreateGameMessage.bind(this));

		// send create game message

		// wait for created message and then continue to next screen
	}

	private connectToServer(onConnected: Function) {
		DebugInfo.info('Connecting to server ....');

		let communicationHandler: CommunicationHandler;
		let timeController = new GameTimeController();
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
		this._clientMessageSender = new ClientMessageSender(communicationHandler);

	}

	private sendCreateGameMessage() {
		DebugInfo.info('Create game message');

		const CLIENT_ID_COOKIE = 'clientId'

		let clientId = CookieHelper.getCookie(CLIENT_ID_COOKIE);
		if (!clientId) {
			clientId = GuidHelper.newGuid();
			CookieHelper.setCookie(CLIENT_ID_COOKIE, clientId, 365);
		}

		this._clientMessageSender.createGame({
			clientId: clientId,
			name: 'Testsession ' + ++this._gameCounter,
			password: '',
			maxPlayers: 4
		});
	}

	private _gameCounter: number = 0;
}