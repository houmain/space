import { Faction } from '../data/galaxyModels';
import { Engine } from '../common/utils';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Player } from '../data/gameData';

/* HUD */
export class PlayerHud {

	private _container: Phaser.GameObjects.Container;
	private _numFighters: Phaser.GameObjects.BitmapText;

	public create(scene: Phaser.Scene, galaxyDataHandler: GalaxyDataHandler, player: Player) {

		this._container = scene.add.container(10, 10);

		let textFighters = scene.add.bitmapText(0, 0, 'gameHudText', 'fighters');
		textFighters.setOrigin(0, 0);
		textFighters.setTint(0xbbbbbb);

		this._numFighters = scene.add.bitmapText(0, 20, 'gameHudCounter', '34/100');
		this._numFighters.setOrigin(0, 0);
		this._numFighters.setTint(0x02a3dd);

		this._container.add(textFighters);
		this._container.add(this._numFighters);

		galaxyDataHandler.subscribe(player.factionId, (faction: Faction) => {
			this.onPlayerFactionChanged(faction);
		});
	}

	private onPlayerFactionChanged(faction: Faction) {
		this._numFighters.setText(`${faction.numFighters}/${faction.maxUpkeep}`);
	}
}