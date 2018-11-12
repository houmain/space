import { GameEventObserver, EventPlayerJoined, GameEventType, EventPlanetConquered, EventFactionDestroyed, EventSquadronDestroyed, EventSquadronAttacksPlanet, SceneEvents } from '../logic/event/eventInterfaces';
import { StringUtils } from '../common/utils';
import { TextResources, Texts } from '../localization/textResources';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { BitmapText } from './gui/bitmapText';
import { Player } from '../data/gameData';
import { DebugInfo } from '../common/debug';
import { Planet } from '../data/galaxyModels';

enum GameInfoMessageType {
    PLAYER_JOINED,
    SQUADRON_ATTACKS_PLANET,
    SQUADRON_DESTROYED,
    PLANET_CONQUERED,
    FACTION_DESTROYED
}

export interface GameInfoMessage {
    text: string;
    color: number;
    type: GameInfoMessageType;
    cameraTarget?: Planet;
}

class GameInfo extends Phaser.GameObjects.Container {
    public lifetime: number;

    private _background: NinePatch;

    public constructor(scene: Phaser.Scene, background: NinePatch) {
        super(scene, 0, 0);
        this._background = background;
        this.add(this._background);
    }

    public get height() {
        return this._background.height;
    }
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
            case GameInfoMessageType.SQUADRON_ATTACKS_PLANET:
            case GameInfoMessageType.SQUADRON_DESTROYED:
            case GameInfoMessageType.PLANET_CONQUERED:
            case GameInfoMessageType.FACTION_DESTROYED:
                info = this.buildGameInfoMessage(msg);
                break;
        }
        return info;
    }

    private buildGameInfoMessage(msg: GameInfoMessage): GameInfo {

        let textMarginLeft = 20;
        let textMarginTop = 10;

        let infoBox = new NinePatch(this._scene, 0, 0, 300, 50, 'infoBox', null, {
            top: 16,
            bottom: 16,
            left: 16,
            right: 16
        });
        infoBox.setOrigin(0, 0);
        infoBox.setAlpha(0.5);
        infoBox.setInteractive();
        this._scene.add.existing(infoBox);

        let infoText = new BitmapText(this._scene, textMarginLeft, textMarginTop, 'gameInfo', msg.text);
        infoText.setOrigin(0, 0);
        infoText.setWordWrapWidth(infoBox.width);
        this._scene.add.existing(infoText);

        if (infoText.height + textMarginTop > infoBox.height) {
            infoBox.resize(300, infoText.height + textMarginTop * 2);
        }

        infoBox.on('pointerdown', () => {
            if (msg.cameraTarget) {
                this._scene.events.emit(SceneEvents.CLICKED_ON_INFO, msg.cameraTarget);
            }
        });

        let info = new GameInfo(this._scene, infoBox);
        info.add(infoText);

        return info;
    }
}

export class GameInfoHandler {

    private readonly _player: Player;
    private _scene: Phaser.Scene;

    private _infoBuilder: GameInfoMessageBuilder;
    private _infoMessages: GameInfo[] = [];
    private _queuedInfoMessages: GameInfoMessage[] = [];

    private _container: Phaser.GameObjects.Container;

    public constructor(player: Player, gameEventObserver: GameEventObserver) {
        this._player = player;

        gameEventObserver.subscribe<EventPlayerJoined>(GameEventType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
        gameEventObserver.subscribe<EventSquadronDestroyed>(GameEventType.SQUADRON_ATTACKS_PLANET, this.onSquadronAttacksPlanet.bind(this));
        gameEventObserver.subscribe<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));
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
            color: faction.color,
            type: GameInfoMessageType.PLAYER_JOINED,
            cameraTarget: event.planet
        });
    }

    private onSquadronAttacksPlanet(event: EventSquadronAttacksPlanet) {
        let squadron = event.squadron;
        let planet = event.planet;

        let text;

        if (planet.faction && planet.faction.id === this._player.faction.id) {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_PLANET_UNDER_ATTACK), planet.name, squadron.faction.name);
        }

        if (text) {
            this.addInfoText({
                text: text,
                color: 0xff0000,
                type: GameInfoMessageType.SQUADRON_ATTACKS_PLANET
            });
        }
    }

    private onSquadronDestroyed(event: EventSquadronDestroyed) {
        let squadron = event.squadron;
        let planet = event.planet;

        let text;

        if (planet && squadron.faction && squadron.faction.id === this._player.faction.id) {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_ATTACK_FAILED), planet.name);
        } else {
            if (planet && planet.faction && planet.faction.id === this._player.faction.id) {
                //text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_REPELLED_ATTACK), planet.name);
            }
        }

        if (text) {
            this.addInfoText({
                text: text,
                color: 0xffffff,
                type: GameInfoMessageType.SQUADRON_DESTROYED
            });
        }
    }

    private onPlanetConquered(event: EventPlanetConquered) {
        let faction = event.faction;
        let planet = event.planet;

        let text = '';

        if (faction.id === this._player.faction.id) {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_CONQUERED_PLANET), planet.name);
        } else {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.FACTION_CONQUERED_PLANET), faction.name, planet.name);
        }

        this.addInfoText({
            text: text,
            color: faction.color,
            type: GameInfoMessageType.PLANET_CONQUERED,
            cameraTarget: event.planet
        });
    }

    private onFactionDestroyed(event: EventFactionDestroyed) {
        let faction = event.faction;

        let text = '';
        if (faction.id === this._player.faction.id) {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_GAME_OVER));
        } else {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.FACTION_DESTROYED), faction.name);
        }

        this.addInfoText({
            text: text,
            color: faction.color,
            type: GameInfoMessageType.FACTION_DESTROYED
        });
    }

    private addInfoText(msg: GameInfoMessage) {
        this._queuedInfoMessages.push(msg);
    }

    private showInfoText(msg: GameInfoMessage) {
        let info = this._infoBuilder.buildGameInfo(msg);

        if (info) {
            info.lifetime = 5000;
            info.x = 0;
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
        let totalHeight = 0;
        let distance = 10;

        this._infoMessages.forEach(info => {
            totalHeight += (info.height + distance);
            info.y = -totalHeight;
        });
    }
}