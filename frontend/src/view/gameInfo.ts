import { Engine } from '../common/utils';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Faction } from '../data/galaxyModels';
import { Player } from '../data/gameData';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessagePlanetConquered, ServerMessageType, MessagePlayerJoined } from '../communication/communicationInterfaces';


export interface GameInfoMessage {
    text: string;
    color: number;
}

export class GameInfo {
    public text: Phaser.GameObjects.Text;
    public age: number;
}

export class GameInfoHandler {

    private _scene: Phaser.Scene;
    private _galaxyDataHandler: GalaxyDataHandler;
    private _infos: GameInfo[] = [];
    private _queuedInfoMessage: GameInfoMessage[] = [];

    private _container: Phaser.GameObjects.Container;

    public constructor(galaxyDataHandler: GalaxyDataHandler, serverMessageObserver: ObservableServerMessageHandler) {

        this._galaxyDataHandler = galaxyDataHandler;

        serverMessageObserver.subscribe<MessagePlayerJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
        serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
    }

    public create(scene: Phaser.Scene) {
        this._scene = scene;
        this._container = this._scene.add.container(10, 10);
    }

    private onPlayerJoined(msg: MessagePlayerJoined) {
        console.log('yxyyy');
        this.addInfoText('Player joined', 0x0000ff);
    }

    private onPlanetConquered(msg: MessagePlanetConquered) {
        console.log('xxxxx');
        this.addInfoText('Planet Conquered', 0x0000ff);
    }

    private addInfoText(text: string, color: number) {
        this._queuedInfoMessage.push(
            {
                text: text,
                color: color
            }
        );

    }

    private showInfoText(msg: GameInfoMessage) {
        let info = new GameInfo();
        info.text = this._scene.add.text(100, 10, msg.text, { font: '48px Arial', fill: '#ffffff' });
        // info.text.setScrollFactor(0);
        info.age = 0;
        // this._container.add(info.text);
    }

    public update(timeElapsed: number) {

        if (this._queuedInfoMessage.length > 0) {
            console.log('showing ' + this._queuedInfoMessage.length + ' quered message');
            this._queuedInfoMessage.forEach(msg => {
                this.showInfoText(msg);
            });

            this._queuedInfoMessage.splice(0, this._queuedInfoMessage.length);
        }

        this._infos.forEach((info, index) => {

            info.age += timeElapsed;
            /*if (info.age > 5000) {
                this._infos.splice(index, 1);
            }*/
        });
    }

    private removeInfo(info: GameInfo) {
        info.text.destroy();
    }
}

/* HUD */
export class FactionInfo {

    private _container: Phaser.GameObjects.Container;

    private _text: Phaser.GameObjects.Text;

    public create(scene: Phaser.Scene, galaxyDataHandler: GalaxyDataHandler, player: Player) {
        this._container = scene.add.container(10, 10);

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