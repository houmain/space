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

			let logoText = this.add.text(100, 100, 'SPACE', { fontFamily: 'Arial Black', fontSize: 74, color: '#ffffff' });

			logoText.setInteractive();
			logoText.on('pointerdown', () => {
				this.startGame();
			});
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

