import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { SetupPlayerInfo } from '../communication/clientMessageSender';
import { DebugInfo } from '../common/debug';
import { GameState } from './createNewGame';

export class ChooseAvatarScene extends GuiScene {

	private _gameState: GameState = null;
	private _setupPlayerInfo: SetupPlayerInfo;

	public constructor() {
		super(Scenes.CHOOSE_AVATAR);
	}

	public init(data: any) {
		this._gameState = data.gameState;
		this._setupPlayerInfo = data.setupPlayerInfo;
	}

	public create() {
		super.create();

		this._setupPlayerInfo.avatar = 'avatar01';
		DebugInfo.info(`using Avatar ${this._setupPlayerInfo.avatar}`);

		this.goToChoosePlayerNameScene();
	}

	private goToChoosePlayerNameScene() {
		this.scene.start(Scenes.CHOOSE_NAME, {
			gameState: this._gameState,
			setupPlayerInfo: this._setupPlayerInfo
		});
	}
}