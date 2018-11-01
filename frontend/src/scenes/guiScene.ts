import { Scenes } from './scenes';
import { TextResources, Texts } from '../localization/textResources';

export abstract class GuiScene extends Phaser.Scene {

	private _backgroundImage: Phaser.GameObjects.Image;
	private _sceneTitle: string;

	public constructor(config: string | Phaser.Scenes.Settings.Config) {
		super(config);
		this._sceneTitle = this.getSceneTitle(config as string);
	}

	private getSceneTitle(config: string) {

		let title = '';
		switch (config) {
			case Scenes.MAIN_MENU:
				title = TextResources.getText(Texts.MAIN_MENU.TITLE); break;
			case Scenes.INIT_GAME:
				title = TextResources.getText(Texts.INIT_GAME.TITLE); break;
			default:
				title = 'yet another scene';
		}
		return title;
	}

	public create() {

		this._backgroundImage = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'menuBackground');

		this.add.bitmapText(20, 0, 'font_8', this._sceneTitle);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();
	}

	protected resize() {
		let width = window.innerWidth;
		let height = window.innerHeight;

		this.cameras.resize(width, height);
		this._backgroundImage.setDisplaySize(width, height);
	}
}