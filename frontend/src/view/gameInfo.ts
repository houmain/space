import { Engine } from '../common/utils';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Faction } from '../data/galaxyModels';
import { Player } from '../data/gameData';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessagePlanetConquered, ServerMessageType, MessagePlayerJoined, MessageFactionDestroyed } from '../communication/communicationInterfaces';

enum GameInfoMessageType {
    PLAYER_JOINED,
    PLANET_CONQUERED,
    FACTION_DESTROYED
}

interface GameInfoMessage {
    text: string;
    color: number;
    type: GameInfoMessageType;
}

class GameInfo extends Phaser.GameObjects.Container {
    public lifetime: number;
}

class GameInfoMessageBuilder {

    private _scene: Phaser.Scene;

    public constructor(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public buildGameInfo(msg: GameInfoMessage): GameInfo {
        let info: GameInfo = null;

        switch (msg.type) {
            case GameInfoMessageType.PLAYER_JOINED:
                info = this.buildPlayerJoined(msg);
                break;
            case GameInfoMessageType.PLANET_CONQUERED:
                info = this.buildPlanetConquered(msg);
                break;
            case GameInfoMessageType.FACTION_DESTROYED:
                info = this.buildFactionDestroyed(msg);
                break;
        }
        return info;
    }

    private buildPlayerJoined(msg: GameInfoMessage): GameInfo {
        let info = new GameInfo(this._scene, 0, 0);

        this.addBox(info, msg.color);
        this.addText(info, msg.text);

        return info;
    }

    private buildPlanetConquered(msg: GameInfoMessage): GameInfo {
        let info = new GameInfo(this._scene, 0, 0);

        this.addBox(info, msg.color);
        this.addText(info, msg.text);

        return info;
    }

    private buildFactionDestroyed(msg: GameInfoMessage): GameInfo {
        let info = new GameInfo(this._scene, 0, 0);

        this.addBox(info, msg.color);
        this.addText(info, msg.text);

        return info;
    }

    private addBox(gameInfo: GameInfo, color: number) {
        let graphics = this._scene.add.graphics();
        graphics.fillStyle(color, 0.25);
        graphics.fillRect(0, 0, 350, 30);

        let thickness = 2;
        let alpha = 0.8;
        graphics.lineStyle(thickness, color, alpha);
        graphics.strokeRect(0, 0, 350, 30);

        gameInfo.add(graphics);
    }

    private addText(gameInfo: GameInfo, text: string) {
        let textField = this._scene.add.text(5, 5, text);
        gameInfo.add(textField);
    }
}

export class GameInfoHandler {

    private _infoBuilder: GameInfoMessageBuilder;
    private _galaxyDataHandler: GalaxyDataHandler;
    private _infoMessages: GameInfo[] = [];
    private _queuedInfoMessages: GameInfoMessage[] = [];

    private _container: Phaser.GameObjects.Container;

    public constructor(galaxyDataHandler: GalaxyDataHandler, serverMessageObserver: ObservableServerMessageHandler) {

        this._galaxyDataHandler = galaxyDataHandler;

        serverMessageObserver.subscribe<MessagePlayerJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
        serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
        serverMessageObserver.subscribe<MessageFactionDestroyed>(ServerMessageType.FACTION_DESTROYED, this.onFactionDestroyed.bind(this));
    }

    public create(scene: Phaser.Scene) {
        this._infoBuilder = new GameInfoMessageBuilder(scene);
        this._container = scene.add.container(10, 10);
    }

    private onPlayerJoined(msg: MessagePlayerJoined) {
        let faction = this._galaxyDataHandler.factions[msg.factionId];

        this.addInfoText({
            text: `${faction.name} joined`,
            color: faction.color,
            type: GameInfoMessageType.PLAYER_JOINED
        });
    }

    private onPlanetConquered(msg: MessagePlanetConquered) {
        let faction = this._galaxyDataHandler.factions[msg.factionId];
        let planet = this._galaxyDataHandler.planets[msg.planetId];

        this.addInfoText({
            text: `${faction.name} conquered ${planet.name}`,
            color: faction.color,
            type: GameInfoMessageType.PLANET_CONQUERED
        });
    }

    private onFactionDestroyed(msg: MessageFactionDestroyed) {
        let faction = this._galaxyDataHandler.factions[msg.factionId];

        this.addInfoText({
            text: `${faction.name} has been eliminated`,
            color: faction.color,
            type: GameInfoMessageType.FACTION_DESTROYED
        });
    }

    private addInfoText(msg: GameInfoMessage) {
        this._queuedInfoMessages.push(msg);
    }

    private showInfoText(msg: GameInfoMessage) {
        let info = this._infoBuilder.buildGameInfo(msg);
        info.lifetime = 5000;
        info.y = 40 * this._infoMessages.length;
        this._container.add(info);

        this._infoMessages.push(info);
    }

    public update(timeElapsed: number) {

        if (this._queuedInfoMessages.length > 0) {
            this._queuedInfoMessages.forEach(msg => {
                this.showInfoText(msg);
            });

            this._queuedInfoMessages.splice(0, this._queuedInfoMessages.length);
        }

        let rearrangeInfos = false;

        this._infoMessages.forEach((info, index) => {
            info.lifetime -= timeElapsed;

            if (info.lifetime < 0) {
                this.removeInfo(info);
                rearrangeInfos = true;
            }
        });

        if (rearrangeInfos) {
            this._infoMessages.forEach((info, index) => {
                info.y = 40 * index;
            });
        }
    }

    private removeInfo(info: GameInfo) {
        this._infoMessages.splice(this._infoMessages.indexOf(info), 1);
        this._container.remove(info, true);
    }
}

/* HUD */
export class FactionInfo {

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
        this._container.setScrollFactor(0);

        this._container.setPosition(Engine.instance.config.width as number - 300, 100);

        galaxyDataHandler.subscribe(player.factionId, (faction: Faction) => {
            this.onPlayerFactionChanged(faction);
        });
    }

    private onPlayerFactionChanged(faction: Faction) {
        this._text.setText(`Fighters: ${faction.numFighters}/${faction.maxUpkeep}`);
    }
}