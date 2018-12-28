import { GuiScene } from './guiScene';
import { Scenes } from './scenes';
import { SetupPlayerInfo } from '../communication/clientMessageSender';
import { DebugInfo } from '../common/debug';
import { GameState } from './createNewGame';

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

		this._setupPlayerInfo.name = 'berni';
		this._setupPlayerInfo.color = '0xff0000';
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