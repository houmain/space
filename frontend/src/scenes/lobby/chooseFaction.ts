import { GuiScene } from '../guiScene';
import { Scenes } from '../scenes';
import { SetupPlayerInfo } from '../../communication/clientMessageSender';
import { DebugInfo } from '../../common/debug';
import { GameState } from '../../logic/data/gameState';

export class ChooseFactionScene extends GuiScene {

	private _gameState: GameState = null;

	private _setupPlayerInfo: SetupPlayerInfo = {
		ready: false
	};

	public constructor() {
		super(Scenes.CHOOSE_FACTION);
	}

	public init(data: any) {
		this._gameState = data.gameState;
	}

	public create() {
		super.create();

		this._setupPlayerInfo.factionId = 1;
		DebugInfo.info(`using Faction ${this._setupPlayerInfo.factionId}`);

		this.gotToChooseAvatarScene();
	}

	private gotToChooseAvatarScene() {
		this.scene.start(Scenes.CHOOSE_AVATAR, {
			gameState: this._gameState,
			setupPlayerInfo: this._setupPlayerInfo
		});
	}
}