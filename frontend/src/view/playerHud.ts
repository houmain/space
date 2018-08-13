import { Faction } from '../data/galaxyModels';
import { Engine } from '../common/utils';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Player } from '../data/gameData';

/* HUD */
export class PlayerHud {

	private _container: Phaser.GameObjects.Container;

	private _text: Phaser.GameObjects.Text;

	public create(scene: Phaser.Scene, galaxyDataHandler: GalaxyDataHandler, player: Player) {
		this._container = scene.add.container(10, 10);

		let graphics = scene.add.graphics();
		graphics.fillStyle(0xffffff, 0.25);
		graphics.fillRect(0, 0, 256, 40);

		let color = 0xffffff;
		let thickness = 2;
		let alpha = 1;
		graphics.lineStyle(thickness, color, alpha);
		graphics.strokeRect(0, 0, 256, 40);

		this._container.add(graphics);

		this._text = scene.add.text(10, 10, 'hallo');
		this._container.add(this._text);

		this._container.setPosition(10, 200);
		//this._container.setScrollFactor(0, 0);

		galaxyDataHandler.subscribe(player.factionId, (faction: Faction) => {
			this.onPlayerFactionChanged(faction);
		});
	}

	private onPlayerFactionChanged(faction: Faction) {
		this._text.setText(`Fighters: ${faction.numFighters}/${faction.maxUpkeep} MAX`);
	}
}