import { Scenes } from './scenes';
import { SpaceGameConfig } from '../communication/communicationHandler';
import { GuiFactory } from '../view/gui/guiFactory';

export class MainMenuScene extends Phaser.Scene {

	public constructor() {
		super(Scenes.MAIN_MENU);
	}

	public create() {

		let fastRedirect = false;

		if (fastRedirect) {
			this.startGame();
		} else {
			let background = this.add.tileSprite(0, 0, 2048, 2048, 'mainMenu');
			background.setTint(0x555555);

			let logoText = this.add.text(100, 100, 'Bug? Galore! \nSPACE', { fontFamily: 'Arial Black', fontSize: 74, color: '#ffffff' });

			let guiFactory: GuiFactory = new GuiFactory(this);

			let textButton = guiFactory.buildTextButton('START',
				{
					x: 400,
					y: 500,
					width: 130,
					height: 50
				}, {
					color: 0x99d1f8,
					alpha: 0.9,
					borderColor: 0x3ca6ff,
					borderAlpha: 1,
					borderThickness: 4
				});
			textButton.onMouseDown(() => {
				this.startGame();
			});

			let imageButton1 = guiFactory.buildImageButton('atlasGui', 'player.png', {
				x: 200,
				y: 320,
				width: 100,
				height: 100
			}, {
					color: 0x99d1f8,
					alpha: 0.9,
					borderColor: 0x3ca6ff,
					borderAlpha: 1,
					borderThickness: 4
				}
			);

			let imageButton2 = guiFactory.buildImageButton('atlasGui', 'ai.png', {
				x: 360,
				y: 320,
				width: 100,
				height: 100
			}, {
					color: 0x99d1f8,
					alpha: 0.9,
					borderColor: 0x3ca6ff,
					borderAlpha: 1,
					borderThickness: 4
				}
			);

			let windowColor = 0x303030;
			let borderColor = 0x3ca6ff; //0xffffff;//907748;
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
}

