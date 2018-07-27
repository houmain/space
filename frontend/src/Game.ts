'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { GameTimeHandler } from './logic/gameTimeHandler';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from './communication/communicationHandler';
import { ServerMessageHandler, ServerMessageObserver } from './communication/messageHandler';
import { Galaxy, Faction, Squadron, Fighter } from './data/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';
import { GalaxyHandler } from './logic/galaxyHandler';
import { ServerMessageType, MessageGameJoined, MessageGameUpdated, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFactionDestroyed, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed } from './communication/communicationInterfaces';
import { GalaxyFactory } from './logic/galaxyFactory';
import { InitGameScene } from './scenes/initGame';
import { States } from './scenes/states';
import { Engine, Assert } from './common/utils';
import { Player } from './data/gameData';

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: ServerMessageHandler;
    private _serverMessageObserver: ServerMessageObserver;
    private _gameTimeHandler: GameTimeHandler;
    private _clientMessageSender: ClientMessageSender;

    private _galaxy: Galaxy;
    private _galaxyHandler: GalaxyHandler;

    private _player: Player;

    constructor(config: GameConfig) {
        super(config);

        Engine.init(this);

        this._gameTimeHandler = new GameTimeHandler();
        this._messageHandler = new ServerMessageHandler(this);
        this._serverMessageObserver = new ServerMessageObserver();
        this._communicationHandler = new CommunicationHandler(this._messageHandler, this._serverMessageObserver);
        this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

        this._messageHandler.onMessageHandlerServerTimeUpdate = this._gameTimeHandler.updateServerTime.bind(this._gameTimeHandler);
        /*
                this._serverMessageObserver.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined);
                this._serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated);
                this._serverMessageObserver.subscribe<MessageSquadronSent>(ServerMessageType.SQUADRON_SENT, this.onSquadronSent);
                this._serverMessageObserver.subscribe<MessageSquadronsMerged>(ServerMessageType.SQUADRONS_MERGED, this.onSquadronsMerged);
                this._serverMessageObserver.subscribe<MessageSquadronAttacks>(ServerMessageType.SQUADRON_ATTACKS, this.onSquadronAttacks);
                this._serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed);
                this._serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered);
                this._serverMessageObserver.subscribe<MessageSquadronDestroyed>(ServerMessageType.SQUADRON_DESTROYED, this.onSquadronDestroyed);

        this._serverMessageObserver.subscribe<MessageGameUpdated>(ServerMessageType.GAME_UPDATED, this._gameTimeHandler.updateServerTime2);
*/
        let gameConfig: SpaceGameConfig = {
            url: 'ws://127.0.0.1:9995/'
        };

        this.scene.add(States.PRELOADER, new Preloader(this, gameConfig, this._communicationHandler, this._clientMessageSender), true);
        this.scene.add(States.MAIN, new Main(this, this._gameTimeHandler, this._clientMessageSender));
        this.scene.add(States.INIT_GAME, new InitGameScene(this, this._serverMessageObserver));
        this.scene.add(States.GAME, new GameScene());
        this.scene.add(States.HUD, new HudScene());

        this._player = new Player();
        this._galaxy = new Galaxy();
    }

    public get communcationHandler(): CommunicationHandler {
        return this._communicationHandler;
    }

    public get galaxy(): Galaxy {
        return this._galaxy;
    }

    public get player(): Player {
        return this._player;
    }

    private onGameJoined(msg: MessageGameJoined) {
        console.log('onGameJoined ');

        this._player = new Player();
        this._player.factionId = msg.factionId;

        let galaxy = GalaxyFactory.create(new Galaxy(), msg.factions, msg.planets, msg.squadrons);
        this.initGalaxy(galaxy);
    }

    // TODO: REMOVE
    public gameJoined(factionId: number) {
        this._player = new Player();
        this._player.factionId = factionId;
    }

    // TODO: PRIVATE
    public initGalaxy(galaxy: Galaxy) {
        this._galaxy = galaxy;
        this._galaxyHandler = new GalaxyHandler();
        this._galaxyHandler.init(this._galaxy);
    }

    public get initialized(): boolean {
        return this._galaxy.planets.length > 0;
    }

    public resize(width: number, height: number) {
        console.log(`TODO: should resize to ${width} and ${height}`);
    }

    private onFighterCreated(msg: MessageFighterCreated) {
        let squadron = this._galaxyHandler.squadrons[msg.squadronId];

        if (squadron) {
            squadron.fighters.push(new Fighter());
        } else {
            console.error('Unknown squadron with id ' + msg.squadronId);
        }

        Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::createFighter: squadron ${msg.squadronId}
        Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
    }

    // TODO: remove
    public createFighter(planetId: number, squadronId: number, fighterCount: number) {
        let squadron = this._galaxyHandler.squadrons[squadronId];

        if (squadron) {
            squadron.fighters.push(new Fighter());
        } else {
            console.error('Unknown squadron with id ' + squadronId);
        }

        Assert.equals(squadron.fighters.length, fighterCount, `Game::createFighter: squadron ${squadronId}
        Incorrect Fighter count client: ${squadron.fighters.length} server: ${fighterCount}`);
    }

    private onSquadronSent(msg: MessageSquadronSent) {
        let sentSquadron: Squadron = this._galaxyHandler.squadrons[msg.squadronId];

        if (!sentSquadron) {
            sentSquadron = this.createSquadron(msg.factionId, msg.squadronId);
        }

        let sourceSquadron = this._galaxyHandler.squadrons[msg.sourceSquadronId];
        let sentFighters = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - msg.fighterCount, msg.fighterCount);
        sentSquadron.fighters.push(sentFighters);
    }

    // TODO: remove
    public squadronSent(factionId: number, sourcePlanetId: number, sourceSquadronId: number, targetPlanetId: number,
        squadronId: number, fighterCount: number) {

        let sentSquadron: Squadron = this._galaxyHandler.squadrons[squadronId];

        if (!sentSquadron) {
            sentSquadron = this.createSquadron(factionId, squadronId);
        }

        let sourceSquadron = this._galaxyHandler.squadrons[sourceSquadronId];
        let sentFighters = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - fighterCount, fighterCount);
        sentSquadron.fighters.push(sentFighters);
    }

    private createSquadron(factionId: number, squadronId: number): Squadron {
        // TODO update galaxy squadrons
        let squadron = new Squadron();
        squadron.id = squadronId;
        squadron.faction = this._galaxyHandler.factions[factionId];
        this._galaxyHandler.squadrons[squadronId] = squadron;
        return squadron;
    }

    private onSquadronsMerged(msg: MessageSquadronsMerged) {
        let sourceSquadron = this._galaxyHandler.squadrons[msg.squadronId];
        let targetSquadron = this._galaxyHandler.squadrons[msg.intoSquadronId];

        let fighters = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
        targetSquadron.fighters.push(fighters);

        Assert.equals(targetSquadron.fighters.length, msg.fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${msg.fighterCount}`);

        this.deleteSquadron(msg.planetId, msg.squadronId);
    }

    // TODO: remove
    public squadronsMerged(planetId: number, squadronId: number, intoSquadronId: number, fighterCount: number) {
        let sourceSquadron = this._galaxyHandler.squadrons[squadronId];
        let targetSquadron = this._galaxyHandler.squadrons[intoSquadronId];

        let fighters = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
        targetSquadron.fighters.push(fighters);

        Assert.equals(targetSquadron.fighters.length, fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${fighterCount}`);

        this.deleteSquadron(planetId, squadronId);
    }

    private onSquadronAttacks(msg: MessageSquadronAttacks) {
        let sentSquadron: Squadron = this._galaxyHandler.squadrons[msg.squadronId];
        let planet = this._galaxyHandler.planets[msg.planetId];
        planet.squadrons.push(sentSquadron);
    }

    // TODO: remove
    public squadronAttacks(planetId: number, squadronId: number) {
        let sentSquadron: Squadron = this._galaxyHandler.squadrons[squadronId];
        let planet = this._galaxyHandler.planets[planetId];
        planet.squadrons.push(sentSquadron);
    }

    private onFighterDestroyed(msg: MessageFighterDestroyed) {
        let squadron = this._galaxyHandler.squadrons[msg.squadronId];

        if (squadron) {
            squadron.fighters.splice(squadron.fighters.length - 2, 1);
            Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::fighterDestroyed: Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
        } else {
            console.error('Unknown squadron with id ' + msg.squadronId);
        }
    }

    // TODO: remove
    public fighterDestroyed(planetId: number, squadronId: number, remainingFighterCount: number, bySquadronId: number) {
        let squadron = this._galaxyHandler.squadrons[squadronId];

        if (squadron) {
            squadron.fighters.splice(squadron.fighters.length - 2, 1);
            Assert.equals(squadron.fighters.length, remainingFighterCount, `Game::fighterDestroyed: Incorrect Fighter count client: ${squadron.fighters.length} server: ${remainingFighterCount}`);
        } else {
            console.error('Unknown squadron with id ' + squadronId);
        }
    }

    private onPlanetConquered(msg: MessagePlanetConquered) {
        let faction = this._galaxyHandler.factions[msg.factionId];
        let planet = this._galaxyHandler.planets[msg.planetId];

        planet.faction = faction;
    }

    // TODO: remove
    public planetConquered(factionId: number, planetId: number) {
        let faction = this._galaxyHandler.factions[factionId];
        let planet = this._galaxyHandler.planets[planetId];

        planet.faction = faction;
    }

    private onSquadronDestroyed(msg: MessageSquadronDestroyed) {
        this.deleteSquadron(msg.planetId, msg.squadronId);
    }

    // TODO: remove
    public squadronDestroyed(planetId: number, squadronId: number) {
        this.deleteSquadron(planetId, squadronId);
    }

    private deleteSquadron(planetId: number, squadronId: number) {
        // TODO update galaxy squadrons
        let planet = this._galaxyHandler.planets[planetId];
        let squadron = this._galaxyHandler.squadrons[squadronId];

        let index = planet.squadrons.indexOf(squadron);
        if (index !== -1) {
            planet.squadrons.splice(index, 1);
        }

        delete this._galaxyHandler.squadrons[squadronId];
    }

    public factionDestroyed(factionId: number) {
        let faction: Faction = this._galaxyHandler.factions[factionId];
        faction.destroyed = true;
    }
}

function startGame(): void {

    const config = {
        type: Phaser.AUTO,
        parent: 'canvas',
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [
            //Preloader,
            // Main
        ]
    };

    const game = new SpaceGame(config);

    window.addEventListener('resize', function (event) {
        game.resize(window.innerWidth, window.innerHeight);
    }, false);
}
window.onload = () => {
    console.log('Starting game');
    startGame();
};
