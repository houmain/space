import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { Assets } from '../view/assets';
import { RoundButton } from '../view/gui/roundButton';
import { Texts, TextResources } from '../localization/textResources';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { ServerMessageQueue } from '../communication/messageHandler';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { ClientMessageSender } from '../communication/clientMessageSender';
import { DebugInfo } from '../common/debug';

class PlayerSettingsBox extends Phaser.GameObjects.Container {

	private _name: Phaser.GameObjects.BitmapText;
	private _avatar: Phaser.GameObjects.Sprite;

	public constructor(scene: Phaser.Scene) {
		super(scene);

		let fontSize = 60;

		let box = new NinePatch(scene, 0, 0, 400, 600, 'infoBox', null, {
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

		this._avatar = scene.add.sprite(box.width - 100, 100, Assets.ATLAS.AVATARS, 'faction01.png');

		this.add(box);
		this.add(nameLabel);
		this.add(this._name);
		this.add(colorLabel);
		this.add(this._avatar);
	}

	public changeAvatarImage(frame: string) {
		this._avatar.setFrame(frame);
	}
}

class ClickImage extends Phaser.GameObjects.Sprite {

	public onClick: (objectId: string) => void;

	public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
		super(scene, x, y, texture, frame);
		//this.setTint(0x7c9cd2);
		this.setAlpha(0.3);
		this.setInteractive();

		this.on('pointerover', function () {
			//	this.setTint(0xffffff);
			this.setAlpha(1);
		});

		this.on('pointerout', function () {
			//	this.setTint(0x7c9cd2);
			this.setAlpha(0.3);
		});

		this.on('pointerdown', function () {
			this.onClick(this.name);
		});
	}
}

interface ChangeAvatarImageFunction { (sprite: string): void; }

class AvatarsBox extends Phaser.GameObjects.Container {

	public constructor(scene: Phaser.Scene, changeAvatarImage: ChangeAvatarImageFunction) {
		super(scene);

		let box = new NinePatch(scene, 0, 0, 400, 600, 'infoBox', null, {
			top: 16,
			bottom: 16,
			left: 16,
			right: 16
		});
		box.setOrigin(0, 0);
		box.setAlpha(0.5);
		scene.add.existing(box);

		this.add(box);

		let row = 0;
		let column = 0;
		let avatarWidth = 110;
		let avatarHeight = 110;
		let padding = 20;
		let avatars = ['faction01.png', 'faction02.png', 'faction03.png', 'faction04.png', 'faction05.png'];
		for (let a = 0; a < avatars.length; a++) {
			let x = column * avatarWidth + column * padding;
			let y = row * avatarHeight + row * padding;

			if (x > box.width - padding) {
				row++;
				column = 0;

				x = column * avatarWidth + column * padding;
				y = row * avatarHeight + row * padding;
			}

			let avatar = new ClickImage(scene, x, y, Assets.ATLAS.AVATARS, avatars[a]);
			avatar.setOrigin(0, 0);
			avatar.setName(avatars[a]);
			avatar.onClick = (name: string) => {
				DebugInfo.info('name' + name);
				changeAvatarImage(name);
			};
			//	avatar.setInteractive();
			this.add(avatar);

			column++;
		}
		/*
				scene.input.on('pointerover', function (event, gameObjects) {
					gameObjects[0].setTint(0xff0000);
				});

				scene.input.on('pointerout', function (event, gameObjects) {
					gameObjects[0].clearTint();
				});

				scene.input.on('pointerdown', function (event, gameObjects) {
					DebugInfo.info((gameObjects[0] as Phaser.GameObjects.Sprite).name);
					changeAvatarImage((gameObjects[0] as Phaser.GameObjects.Sprite).name);
				});*/
	}
}

export class PlayerSettingsScene extends GuiScene {

	private _container: Phaser.GameObjects.Container;

	private _playerSettingsBox: PlayerSettingsBox;
	private _avatarsBox: AvatarsBox;

	private _serverMessageQueue: ServerMessageQueue;
	private _timeController: GameTimeController;
	private _clientMessageSender: ClientMessageSender;

	private _gameId: number;
	private _factionId: number;

	public constructor() {
		super(Scenes.PLAYER_SETTINGS);
	}

	public init(data: any) {
		this._serverMessageQueue = data.serverMessageQueue;
		this._timeController = data.timeController;
		this._clientMessageSender = data.clientMessageSender;
		this._gameId = data.gameId;
		this._factionId = data.factionId;
	}

	public create() {
		super.create();

		this._container = this.add.container(0, 0);

		this._playerSettingsBox = new PlayerSettingsBox(this);
		this._playerSettingsBox.setPosition(200, 200);

		this._avatarsBox = new AvatarsBox(this, this._playerSettingsBox.changeAvatarImage.bind(this._playerSettingsBox));
		this._avatarsBox.setPosition(800, 200);

		let createButton = new RoundButton(this);
		createButton.setPosition(800, 800);
		createButton.onClick = () => {
			/*
						this._clientMessageSender.sendPlayerInfo(this._factionId, {
							avatar: 'faction01',
							name: 'Berni',
							color: '0xff0000',
							factionIcon: 'faction01',
						});
			*/
			this.goToLobby();
		};

		this._container.add(this._playerSettingsBox);
		this._container.add(this._avatarsBox);
		this._container.add(createButton);
	}

	private goToLobby() {
		this.scene.start(Scenes.LOBBY, {
			serverMessageQueue: this._serverMessageQueue,
			timeController: this._timeController,
			clientMessageSender: this._clientMessageSender,
			factionId: this._factionId
		});
	}
}