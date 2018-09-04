import { Scenes } from './scenes';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { GuiFactory } from '../view/gui/guiFactory';
import { GuiConfig } from '../view/gui/guiConfigModels';
import { Assets } from '../view/assets';

//https://github.com/goldfire/phaser-webpack-loader/tree/master/src
//https://github.com/rroylance/phaser-npm-webpack-typescript-starter-project/blob/master/src/app.ts
//https://snowbillr.github.io/blog//2018-04-09-a-modern-web-development-setup-for-phaser-3/

export class MainMenuScene extends Phaser.Scene {

	private _backgroundImage: Phaser.GameObjects.Image;

	public constructor() {
		super(Scenes.MAIN_MENU);
	}

	public create() {
		this._backgroundImage = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'menuBackground');

		let container = this.add.container(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
		let background = this.add.image(0, 0, Assets.ATLAS.MAIN_MENU2, 'button_large.png');
		container.add(background);
		container.add(this.add.image(0, 0, Assets.ATLAS.MAIN_MENU2, 'button_large_outer_wheel.png'));
		container.add(this.add.image(0, -35, Assets.ATLAS.MAIN_MENU2, 'button_large_inner_wheel_active.png'));
		let hook = this.add.image(0, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_hook.png');
		hook.setScale(1, -1);
		container.add(hook);
		container.add(this.add.image(0, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_hook.png'));

		let ca_top_left = this.add.image(-130, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_top_left.setScale(1, -1);
		container.add(ca_top_left);

		let ca_topright = this.add.image(130, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_topright.setScale(-1, -1);
		container.add(ca_topright);

		let ca_bottom_left = this.add.image(-130, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		container.add(ca_bottom_left);

		let ca_bottom_right = this.add.image(130, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_bottom_right.setScale(-1, 1);
		container.add(ca_bottom_right);

		background.setInteractive();
		background.on('pointerdown', () => {
			this.startGame();
		});

		let buttonText = this.add.bitmapText(this.sys.canvas.width / 2, this.sys.canvas.height / 2 + 200, 'font_6', 'PLAY');
		buttonText.setOrigin(0.5, 0.5);

		let currentScene = this.add.bitmapText(20, 0, 'font_8', 'main menu');

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();
	}

	public createOPld() {

		let fastRedirect = false;

		if (fastRedirect) {
			this.startGame();
		} else {
			//let background = this.add.tileSprite(0, 0, 2048, 2048, 'mainMenu');
			//	background.setTint(0x555555);
			this._backgroundImage = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'menuBackground');

			let logoText = this.add.text(100, 100, 'SPACE', { fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff' });

			let guiFactory: GuiFactory = new GuiFactory(this);

			let textButton = guiFactory.buildTextButton('QUIT',
				{
					x: 400,
					y: 500,
					width: 130,
					height: 50
				}, GuiConfig.textButton);
			textButton.onMouseDown(() => {
				this.quitGame();
			});

			let imageButton1 = guiFactory.buildImageButton('atlasGui', 'player.png', {
				x: 200,
				y: 320,
				width: 100,
				height: 100
			}, GuiConfig.imageButton
			);
			imageButton1.onMouseDown(() => {
				this.startGame();
			});

			let imageButton2 = guiFactory.buildImageButton('atlasGui', 'ai.png', {
				x: 360,
				y: 320,
				width: 100,
				height: 100
			}, GuiConfig.imageButton
			);
			imageButton2.onMouseDown(() => {
				this.startAiMenu();
			});

			let windowColor = 0x303030;
			let borderColor = 0x3ca6ff;
			let borderAlpha = 1;
			let borderThickness = 3;
			let windowAlpha = 0.8;

			let rectWidth = 300;
			let rectHeight = 100;

			let graphics = this.add.graphics();
			graphics.fillStyle(windowColor, windowAlpha);
			graphics.fillRect(1, 1, rectWidth - 1, rectHeight - 1);

			graphics.lineStyle(borderThickness, borderColor, borderAlpha);
			graphics.strokeRect(0, 0, rectWidth, rectHeight);

			let text = this.add.text(10, 10, 'With the basic functionality of the window in place, we will now work on adding the actual dialog',
				{
					wordWrap: { width: rectWidth - 10 }
				});


			let container = this.add.container(200, 600);
			container.add(graphics);
			container.add(text);
		}

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();
	}

	private resize() {

		let width = window.innerWidth;
		let height = window.innerHeight;

		this.cameras.resize(width, height);
		this._backgroundImage.setDisplaySize(width, height);
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

