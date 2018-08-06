import { Engine } from '../common/utils';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Faction } from '../data/galaxyModels';
import { Player } from '../data/gameData';

export class GameInfo {
    text: Phaser.GameObjects.Text;
    age: number;
}

export class GameInfoHandler {

    private _scene: Phaser.Scene;
    private _infos: GameInfo[] = [];

    public constructor(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public addInfoText(text: string) {

        let info = new GameInfo();
        info.text = this._scene.add.text(0, 0, text);
        info.text.setScrollFactor(0);
        info.age = 0;
    }

    public update(timeElapsed: number) {
        this._infos.forEach((info, index) => {

            info.age += timeElapsed;

            if (info.age > 5000) {
                this._infos.splice(index, 1);
            }
        });
    }

    private removeInfo(info: GameInfo) {
        info.text.destroy();
    }
}

export class FactionInfo {

    private _container: Phaser.GameObjects.Container;

    private _text: Phaser.GameObjects.Text;

    public create(scene: Phaser.Scene, galaxyDataHandler: GalaxyDataHandler, player: Player) {
        this._container = scene.add.container(100, 100);

        let graphics = scene.add.graphics();
        graphics.fillStyle(0x0000ff, 0.25);
        graphics.fillRect(0, 0, 256, 50);

        let color = 0x0000cc;
        let thickness = 2;
        let alpha = 1;
        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(0, 0, 256, 50);

        this._container.add(graphics);

        this._text = scene.add.text(10, 10, 'hallo');
        this._container.add(this._text);
        this._container.setScrollFactor(0);

        this._container.setPosition(Engine.instance.config.width as number - 300, 100);

        galaxyDataHandler.subscribe(player.factionId, (faction: Faction) => {
            this.onPlayerFactionChanged(faction);
        });
    }

    private onPlayerFactionChanged(faction: Faction) {
        this._text.setText(`${faction.numFighters}/${faction.maxUpkeep}`);
    }
}