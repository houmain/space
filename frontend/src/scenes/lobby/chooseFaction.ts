import { GuiScene } from '../guiScene';
import { Scenes } from '../scenes';
import { SetupPlayerInfo } from '../../communication/clientMessageSender';
import { DebugInfo } from '../../common/debug';
import { GameState } from './createNewGame';

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

		this._setupPlayerInfo.faction = 'faction01';
		DebugInfo.info(`using Faction ${this._setupPlayerInfo.faction}`);

		this.gotToChooseAvatarScene();
	}

	private gotToChooseAvatarScene() {
		this.scene.start(Scenes.CHOOSE_AVATAR, {
			gameState: this._gameState,
			setupPlayerInfo: this._setupPlayerInfo
		});
	}
}