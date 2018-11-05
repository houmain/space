import { Player } from '../data/gameData';
import { GameEventObserver, GameEventType } from '../logic/event/eventInterfaces';
import { Texts, TextResources } from '../localization/textResources';

/* HUD */
export class PlayerHud {

	private _container: Phaser.GameObjects.Container;
	private _numFighters: Phaser.GameObjects.BitmapText;

	private _player: Player;

	public create(scene: Phaser.Scene, gameEventObserver: GameEventObserver, player: Player) {

		this._container = scene.add.container(10, 10);
		this._player = player;

		let textFighters = scene.add.bitmapText(0, 0, 'gameHudText', TextResources.getText(Texts.GAME.FIGHTERS));
		textFighters.setOrigin(0, 0);
		textFighters.setTint(0xbbbbbb);

		this._numFighters = scene.add.bitmapText(0, 20, 'gameHudCounter', '0/0');
		this._numFighters.setOrigin(0, 0);
		this._numFighters.setTint(0x02a3dd);

		this._container.add(textFighters);
		this._container.add(this._numFighters);

		gameEventObserver.subscribe(GameEventType.FIGHTER_CREATED, this.onPlayerFactionChanged.bind(this));
		gameEventObserver.subscribe(GameEventType.FIGHTER_DESTROYED, this.onPlayerFactionChanged.bind(this));

		this.updateFighterCount();
	}

	private onPlayerFactionChanged() {
		this.updateFighterCount();
	}

	private updateFighterCount() {
		let faction = this._player.faction;
		this._numFighters.setText(`${faction.numFighters}/${faction.maxUpkeep}`);
	}
}