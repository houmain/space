import { Scenes } from './scenes';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { GuiScene } from './guiScene';
import { Texts, TextResources } from '../localization/textResources';
import { MainMenuButton } from '../view/gui/mainMenuButton';
import { NinePatch } from '@koreez/phaser3-ninepatch';


export class InfoBoxNew {

	private _container: Phaser.GameObjects.Container;
	private _scene: Phaser.Scene;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public create() {
		this._container = this._scene.add.container(850, 100);

		let ninePatch = new NinePatch(this._scene, 0, 0, 300, 200, 'infoBox', null, {
			top: 16, // Amount of pixels for top
			bottom: 16, // Amount of pixels for bottom
			left: 16, // Amount of pixels for left
			right: 16 // Amount of pixels for right
		});
		ninePatch.setOrigin(0, 0);
		ninePatch.setAlpha(0.5);
		this._scene.add.existing(ninePatch);

		let text = this._scene.add.bitmapText(20, 20, 'infoText', 'Welcome to \nBug?Galore? \nSpace Odyssey');

		this._container.add(ninePatch);
		this._container.add(text);
	}
}

export class MainMenuScene extends GuiScene {

	public constructor() {
		super(Scenes.MAIN_MENU);
	}

	public create() {
		super.create();

		// TODO: remove
		//	this.startGame();
		//	return;


		let gameButton = new MainMenuButton(this, TextResources.getText(Texts.MAIN_MENU.PLAY).toUpperCase());
		gameButton.setPosition(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
		gameButton.onClick = () => {
			this.startGame();
		};
		this.add.existing(gameButton);

		let optionsButton = new MainMenuButton(this, TextResources.getText(Texts.MAIN_MENU.OPTIONS).toUpperCase());
		optionsButton.setPosition(this.sys.canvas.width / 2 - 350, this.sys.canvas.height / 2);
		optionsButton.setScale(0.9);
		optionsButton.setAlpha(0.9);
		this.add.existing(optionsButton);

		let quitButton = new MainMenuButton(this, TextResources.getText(Texts.MAIN_MENU.QUIT).toUpperCase());
		quitButton.setPosition(this.sys.canvas.width / 2 + 350, this.sys.canvas.height / 2);
		quitButton.setScale(0.9);
		quitButton.setAlpha(0.9);
		quitButton.onClick = () => {
			this.quitGame();
		};
		this.add.existing(quitButton);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();

		let i = new InfoBoxNew(this);
		i.create();
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

	private startAiMenu() {
		this.scene.start(Scenes.BOT_MENU);
	}

	private quitGame() {
		self.close();
	}
}