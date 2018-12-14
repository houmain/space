import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { MainMenuButton } from '../view/gui/mainMenuButton';
import { TextResources, Texts } from '../localization/textResources';
import { GuiConfig } from '../view/gui/guiConfig';
import { GuiFactory } from '../view/gui/guiFactory';

export class ChooseGameTypeScene extends GuiScene {

	private _container: Phaser.GameObjects.Container;

	public constructor() {
		super(Scenes.CHOOSE_GAME_TYPE);
	}

	public create() {
		super.create();

		this._container = this.add.container(0, 0);

		let header = this.add.bitmapText(0, 0, GuiConfig.TEXT_HEADER_1.fontName, TextResources.getText(Texts.CHOOSE_GAME_TYPE.HEADER), GuiConfig.TEXT_HEADER_1.fontSize);
		header.setOrigin(0.5, 0.5);
		this._container.add(header);

		let createNewGame = new MainMenuButton(this, TextResources.getText(Texts.CHOOSE_GAME_TYPE.CREATE_NEW_GAME).toUpperCase());
		createNewGame.setPosition(-200, 300);
		createNewGame.onClick = () => {
			this.scene.start(Scenes.NEW_GAME_SETTINGS);
		};
		this._container.add(createNewGame);

		let joinGame = new MainMenuButton(this, TextResources.getText(Texts.CHOOSE_GAME_TYPE.JOIN_GAME).toUpperCase());
		joinGame.setPosition(200, 300);
		joinGame.onClick = () => {
			this.scene.start(Scenes.SELECT_EXISTING_GAME);
		};
		this._container.add(joinGame);

		let bounds: Phaser.Geom.Rectangle = this._container.getBounds();
		this._container.setPosition(window.innerWidth / 2, window.innerHeight / 2 - bounds.height / 2);

		let backButton = GuiFactory.buildTextButton(this, 100, window.innerHeight - 250, TextResources.getText(Texts.COMMON.MAIN_MENU).toUpperCase(), GuiConfig.BUTTONS.NAVIGATION_LEFT);
		backButton.onClick = () => {
			this.scene.start(Scenes.MAIN_MENU);
		};
		this.add.existing(backButton);

		let mainMenuButton = GuiFactory.buildIconButton(this, window.innerWidth - 250, 0, GuiConfig.BUTTONS.MAIN_MENU);
		mainMenuButton.onClick = () => {
			this.scene.start(Scenes.MAIN_MENU);
		};
		this.add.existing(mainMenuButton);
	}
}