import { Scenes } from './scenes';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { GuiScene } from './guiScene';
import { Texts, TextResources } from '../localization/textResources';
import { MainMenuButton } from '../view/gui/mainMenuButton';

//https://github.com/goldfire/phaser-webpack-loader/tree/master/src
//https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/blob/master/src/app.ts
//https://snowbillr.github.io/blog//2018-04-09-a-modern-web-development-setup-for-phaser-3/

export class MainMenuScene extends GuiScene {

	//private _backgroundImage: Phaser.GameObjects.Image;

	public constructor() {
		super(Scenes.MAIN_MENU);
	}

	public create() {
		super.create();

		let gameButton = new MainMenuButton(this, TextResources.getText(Texts.MAINMENU_PLAY).toUpperCase());
		gameButton.setPosition(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
		gameButton.onClick = () => {
			this.startGame();
		};
		this.add.existing(gameButton);

		let optionsButton = new MainMenuButton(this, TextResources.getText(Texts.MAINMENU_OPTIONS).toUpperCase());
		optionsButton.setPosition(this.sys.canvas.width / 2 - 350, this.sys.canvas.height / 2);
		optionsButton.setScale(0.9);
		optionsButton.setAlpha(0.9);
		this.add.existing(optionsButton);

		let quitButton = new MainMenuButton(this, TextResources.getText(Texts.MAINMENU_QUIT).toUpperCase());
		quitButton.setPosition(this.sys.canvas.width / 2 + 350, this.sys.canvas.height / 2);
		quitButton.setScale(0.9);
		quitButton.setAlpha(0.9);
		quitButton.onClick = () => {
			this.quitGame();
		};
		this.add.existing(quitButton);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();
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