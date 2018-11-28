import { GameEventObserver, EventPlayerJoined, GameEventType, EventPlanetConquered, EventFactionDestroyed, EventSquadronDestroyed, EventSquadronAttacksPlanet, SceneEvents, EventFactionWon } from '../logic/event/eventInterfaces';
import { StringUtils } from '../common/utils';
import { TextResources, Texts } from '../localization/textResources';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { BitmapText } from './gui/text/bitmapText';
import { Player } from '../data/gameData';
import { Planet, Faction } from '../data/galaxyModels';
import { Assets } from './assets';

enum GameInfoMessageType {
    PLAYER_JOINED,
    SQUADRON_ATTACKS_PLANET,
    SQUADRON_DESTROYED,
    PLANET_CONQUERED,
    FACTION_DESTROYED,
    FACTION_WON,
}

export interface GameInfoMessage {
    text: string;
    color: number;
    type: GameInfoMessageType;
    cameraTarget?: Planet;
}

export interface PlayerJoinedInfoMessage extends GameInfoMessage {
    faction: Faction;
}

export interface PlanetConqueredInfoMessage extends GameInfoMessage {
    planet: Planet;
}

class GameInfo extends Phaser.GameObjects.Container {
    public lifetime: number;

    private _background: NinePatch;

    public constructor(scene: Phaser.Scene, background: NinePatch) {
        super(scene, 0, 0);
        this._background = background;
        this.add(this._background);
    }

    public set onClick(onClick: Function) {
        this._background.setInteractive();
        this._background.on('pointerdown', onClick);
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
                info = this.buildPlayerJoinedMessage(msg as PlayerJoinedInfoMessage);
                break;
            case GameInfoMessageType.PLANET_CONQUERED:
                info = this.buildPlanetConqueredMessage(msg as PlanetConqueredInfoMessage);
                break;
            case GameInfoMessageType.SQUADRON_ATTACKS_PLANET:
            case GameInfoMessageType.SQUADRON_DESTROYED:
            case GameInfoMessageType.FACTION_DESTROYED:
            case GameInfoMessageType.FACTION_WON:
                info = this.buildGameInfoMessage(msg);
                break;
        }

        if (msg.cameraTarget) {
            info.onClick = () => {
                this._scene.events.emit(SceneEvents.CLICKED_ON_INFO, msg.cameraTarget);
            };
        }

        return info;
    }

    private createBox(width: number, height: number): NinePatch {

        let infoBox = new NinePatch(this._scene, 0, 0, width, height, 'infoBox', null, {
            top: 16,
            bottom: 16,
            left: 16,
            right: 16
        });
        infoBox.setOrigin(0, 0);
        infoBox.setAlpha(0.5);
        this._scene.add.existing(infoBox);

        return infoBox;
    }

    private buildPlayerJoinedMessage(msg: PlayerJoinedInfoMessage): GameInfo {

        let infoBox = this.createBox(400, 150);

        let textMarginLeft = 20;
        let textMarginTop = 10;

        let factionImage = this._scene.add.sprite(10, 10, Assets.ATLAS.AVATARS, msg.faction.avatar);
        factionImage.setOrigin(1, 0);
        factionImage.setPosition(infoBox.width - 20, 20);

        let infoText = new BitmapText(this._scene, textMarginLeft, textMarginTop, 'gameInfo', msg.text);
        infoText.setOrigin(0, 0);
        infoText.setWordWrapWidth(infoBox.width - factionImage.width);
        this._scene.add.existing(infoText);

        let info = new GameInfo(this._scene, infoBox);
        info.add(factionImage);
        info.add(infoText);

        return info;
    }

    private buildPlanetConqueredMessage(msg: PlanetConqueredInfoMessage): GameInfo {

        let infoBox = this.createBox(400, 150);

        let textMarginLeft = 20;
        let textMarginTop = 10;

        let planetImage = this._scene.add.sprite(10, 10, Assets.ATLAS.PLANETS, msg.planet.sprite.frame.name);
        planetImage.setOrigin(1, 0);
        planetImage.setScale(0.75);
        planetImage.setPosition(infoBox.width - 20, 20);

        let infoText = new BitmapText(this._scene, textMarginLeft, textMarginTop, 'gameInfo', msg.text);
        infoText.setOrigin(0, 0);
        infoText.setWordWrapWidth(infoBox.width - planetImage.width);
        this._scene.add.existing(infoText);

        let info = new GameInfo(this._scene, infoBox);
        info.add(planetImage);
        info.add(infoText);

        return info;
    }

    private buildGameInfoMessage(msg: GameInfoMessage): GameInfo {

        let textMarginLeft = 20;
        let textMarginTop = 10;

        let infoBox = this.createBox(400, 50);

        let infoText = new BitmapText(this._scene, textMarginLeft, textMarginTop, 'gameInfo', msg.text);
        infoText.setOrigin(0, 0);
        infoText.setWordWrapWidth(infoBox.width);
        this._scene.add.existing(infoText);

        if (infoText.height + textMarginTop > infoBox.height) {
            infoBox.resize(300, infoText.height + textMarginTop * 2);
        }

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
        gameEventObserver.subscribe<EventFactionDestroyed>(GameEventType.FACTION_WON, this.onFactionWon.bind(this));
    }

    public create(scene: Phaser.Scene) {
        this._scene = scene;

        this._infoBuilder = new GameInfoMessageBuilder(scene);
        this._container = scene.add.container(20, window.innerHeight - 20);
    }

    private onPlayerJoined(event: EventPlayerJoined) {

        let faction = event.faction;

        let playerJoinedMessage: PlayerJoinedInfoMessage = {
            text: StringUtils.fillText(TextResources.getText(Texts.GAME.FACTION_JOINED), faction.name),
            color: faction.color,
            type: GameInfoMessageType.PLAYER_JOINED,
            cameraTarget: event.planet,
            faction: faction
        };

        this.addInfoText(playerJoinedMessage);
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

        let msg: PlanetConqueredInfoMessage = {
            text: text,
            color: faction.color,
            type: GameInfoMessageType.PLANET_CONQUERED,
            cameraTarget: event.planet,
            planet: planet
        };

        this.addInfoText(msg);
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

    private onFactionWon(event: EventFactionWon) {
        let faction = event.faction;

        let text = '';
        if (faction.id === this._player.faction.id) {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_WON_GAME));
        } else {
            text = StringUtils.fillText(TextResources.getText(Texts.GAME.PLAYER_GAME_OVER), faction.name);
        }

        this.addInfoText({
            text: text,
            color: faction.color,
            type: GameInfoMessageType.FACTION_WON
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