import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { MainMenuButton } from '../view/gui/mainMenuButton';
import { TextResources, Texts } from '../localization/textResources';

export class ChooseGameTypeScene extends GuiScene {
	public constructor() {
		super(Scenes.CHOOSE_GAME_TYPE);
	}

	public create() {
		super.create();

		let createNewGame = new MainMenuButton(this, TextResources.getText(Texts.CHOOSE_GAME_TYPE.CREATE_NEW_GAME).toUpperCase());
		createNewGame.setPosition(this.sys.canvas.width / 2 - 260, this.sys.canvas.height / 2);
		createNewGame.onClick = () => {
			this.scene.start(Scenes.NEW_GAME_SETTINGS);
		};
		this.add.existing(createNewGame);

		let joinGame = new MainMenuButton(this, TextResources.getText(Texts.CHOOSE_GAME_TYPE.JOIN_GAME).toUpperCase());
		joinGame.setPosition(this.sys.canvas.width / 2 + 260, this.sys.canvas.height / 2);
		joinGame.onClick = () => {
			this.scene.start(Scenes.SELECT_EXISTING_GAME);
		};
		this.add.existing(joinGame);
	}
}