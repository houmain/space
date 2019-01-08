import { GuiScene } from '../guiScene';
import { Scenes } from '../scenes';
import { SetupPlayerInfo } from '../../communication/clientMessageSender';
import { DebugInfo } from '../../common/debug';
import { GameState } from '../../logic/data/gameState';

export class ChooseNameScene extends GuiScene {

	private _gameState: GameState = null;
	private _setupPlayerInfo: SetupPlayerInfo;

	public constructor() {
		super(Scenes.CHOOSE_NAME);
	}

	public init(data: any) {
		this._gameState = data.gameState;
		this._setupPlayerInfo = data.setupPlayerInfo;
	}

	public create() {
		super.create();

		if (this._gameState.canSetupGame) {
			this._setupPlayerInfo.name = 'berni Client 1';
			this._setupPlayerInfo.color = '0xff0000';
			this._setupPlayerInfo.factionId = 1;
		} else {
			this._setupPlayerInfo.name = 'berni Client 2';
			this._setupPlayerInfo.color = '0x00ff00';
			this._setupPlayerInfo.factionId = 2;
		}

		DebugInfo.info(`using Name ${this._setupPlayerInfo.name} color: ${this._setupPlayerInfo.color}`);

		this.sendPlayerData();
		this.goToLobby();
	}

	private sendPlayerData() {
		this._gameState.clientMessageSender.setupPlayer(this._setupPlayerInfo);
	}

	private goToLobby() {
		this.scene.start(Scenes.LOBBY, {
			gameState: this._gameState,
			setupPlayerInfo: this._setupPlayerInfo
		});
	}
}