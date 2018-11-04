import { GameEventObserver, EventPlayerJoined, GameEventType, EventPlanetConquered, EventFactionDestroyed } from '../logic/event/eventInterfaces';
import { StringUtils, Engine } from '../common/utils';
import { TextResources, Texts } from '../localization/textResources';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { BitmapText } from './gui/bitmapText';

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
            case GameInfoMessageType.PLANET_CONQUERED:
            case GameInfoMessageType.FACTION_DESTROYED:
                info = this.buildGameInfoMessage(msg);
                break;
        }
        return info;
    }

    private buildGameInfoMessage(msg: GameInfoMessage): GameInfo {

        let textMargin = 10;
        let info = new GameInfo(this._scene, 0, 0);

        let infoBox = new NinePatch(this._scene, 0, 0, 300, 50, 'infoBox', null, {
            top: 16,
            bottom: 16,
            left: 16,
            right: 16
        });
        infoBox.setOrigin(0, 0);
        infoBox.setAlpha(0.5);
        this._scene.add.existing(infoBox);

        let infoText = new BitmapText(this._scene, textMargin, textMargin, 'gameInfo', msg.text);
        infoText.setOrigin(0, 0);
        infoText.setWordWrapWidth(infoBox.width);
        this._scene.add.existing(infoText);

        if (infoText.height + textMargin > infoBox.height) {
            infoBox.resize(300, infoText.height + textMargin * 2);
        }

        info.add(infoBox);
        info.add(infoText);

        return info;
    }
}

export class GameInfoHandler {

    private _scene: Phaser.Scene;

    private _infoBuilder: GameInfoMessageBuilder;
    private _infoMessages: GameInfo[] = [];
    private _queuedInfoMessages: GameInfoMessage[] = [];

    private _container: Phaser.GameObjects.Container;

    public constructor(gameEventObserver: GameEventObserver) {

        gameEventObserver.subscribe<EventPlayerJoined>(GameEventType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
        gameEventObserver.subscribe<EventPlanetConquered>(GameEventType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
        gameEventObserver.subscribe<EventFactionDestroyed>(GameEventType.FACTION_DESTROYED, this.onFactionDestroyed.bind(this));
    }

    public create(scene: Phaser.Scene) {
        this._scene = scene;

        this._infoBuilder = new GameInfoMessageBuilder(scene);
        this._container = scene.add.container(20, window.innerHeight - 20);
    }

    private onPlayerJoined(event: EventPlayerJoined) {
        let faction = event.faction;

        this.addInfoText({
            text: StringUtils.fillText(TextResources.getText(Texts.GAME.FACTION_JOINED), faction.name),
            // text: 'Einfach macht es Timo wahrscheinlich nicht mehr. Entweder er trifft gar nicht oder doppelt", sagte danach Leipzigs Trainer Rangnick',
            color: faction.color,
            type: GameInfoMessageType.PLAYER_JOINED
        });
        /*
               this._scene.time.delayedCall(3000, () => {
                   this.addInfoText({
                       text: 'Testtext1',
                       color: faction.color,
                       type: GameInfoMessageType.PLAYER_JOINED
                   });
               }, [], this);

               this._scene.time.delayedCall(4000, () => {
                   this.addInfoText({
                       text: 'Einfach macht es Timo wahrscheinlich nicht mehr. Entweder er trifft gar nicht oder doppelt", sagte danach Leipzigs Trainer Rangnick',
                       color: faction.color,
                       type: GameInfoMessageType.PLAYER_JOINED
                   });
               }, [], this);

               this._scene.time.delayedCall(4000, () => {
                   this.addInfoText({
                       text: 'Testtext3 Testtext3 \n Testtext3Testtext3 ',
                       color: faction.color,
                       type: GameInfoMessageType.PLAYER_JOINED
                   });
               }, [], this);*/
    }

    private onPlanetConquered(event: EventPlanetConquered) {
        let faction = event.faction;
        let planet = event.planet;

        this.addInfoText({
            text: StringUtils.fillText(TextResources.getText(Texts.GAME.PLANET_CONQUERED), faction.name, planet.name),
            color: faction.color,
            type: GameInfoMessageType.PLANET_CONQUERED
        });
    }

    private onFactionDestroyed(event: EventFactionDestroyed) {
        let faction = event.faction;

        this.addInfoText({
            text: StringUtils.fillText(TextResources.getText(Texts.GAME.FACTION_DESTROYED), faction.name),
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
        info.x = 0;
        //   info.y = -200 - this._infoMessages.length * info.height;  //TODO replace with info height
        info.alpha = 0;

        this._container.add(info);
        this._infoMessages.push(info);

        this._scene.tweens.add({
            targets: info,
            alpha: 1,
            duration: 500,
            ease: 'Linear',
        });
    }

    public update(timeElapsed: number) {
        let rearrangeInfos = false;

        if (this._queuedInfoMessages.length > 0) {
            this._queuedInfoMessages.forEach(msg => {
                this.showInfoText(msg);
            });

            this._queuedInfoMessages.splice(0, this._queuedInfoMessages.length);
            rearrangeInfos = true;
        }

        this._infoMessages.forEach((info, index) => {
            info.lifetime -= timeElapsed;

            if (info.lifetime < 0) {
                this.removeInfo(info);
                rearrangeInfos = true;
            }
        });

        if (rearrangeInfos) {
            /*
             this._infoMessages.forEach((info, index) => {
                 info.y = -70 - (index + 1) * info.height * 2;  //TODO replace with info height
             });*/
            this.arrangeInfos();
        }
    }

    private removeInfo(info: GameInfo) {
        this._infoMessages.splice(this._infoMessages.indexOf(info), 1);

        this._scene.tweens.add({
            targets: info,
            alpha: 0,
            duration: 500,
            ease: 'Linear',
            onComplete: () => {
                this._container.remove(info, true);
            }
        });
    }

    private arrangeInfos() {
        let height = Engine.instance.config.height as number;
        let marginBottom = 100;
        let totalHeight = 0;
        let distance = 20;

        this._infoMessages.forEach((info, index) => {
            totalHeight += info.height + distance;
            info.y = -100 - totalHeight;

        });
    }
}