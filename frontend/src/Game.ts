'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { Engine, Assert } from './model/utils';
import { GameTimeHandler } from './model/gameTimeHandler';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from './communication/communicationHandler';
import { ServerMessageHandler } from './communication/messageHandler';
import { Galaxy, Planet, Faction, Squadron, Fighter, Player } from './model/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';
import { GalaxyHandler } from './model/galaxyHandler';

export enum States {
    PRELOADER = 'preloader',
    MAIN = 'main',
    GAME = 'game',
    HUD = 'hud'
}

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: ServerMessageHandler;
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
        this._communicationHandler = new CommunicationHandler(this._messageHandler);
        this._clientMessageSender = new ClientMessageSender(this._communicationHandler);

        this._messageHandler.onMessageHandlerServerTimeUpdate = this._gameTimeHandler.updateServerTime.bind(this._gameTimeHandler);

        let gameConfig: SpaceGameConfig = {
            url: 'ws://127.0.0.1:9995/'
        };

        this.scene.add(States.PRELOADER, new Preloader(this, gameConfig, this._communicationHandler, this._clientMessageSender), true);
        this.scene.add(States.MAIN, new Main(this, this._gameTimeHandler, this._clientMessageSender));
        this.scene.add(States.GAME, new GameScene(this, this._gameTimeHandler, this._clientMessageSender));
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

    public gameJoined(factionId: number) {
        this._player = new Player();
        this._player.factionId = factionId;
    }

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

    public squadronsMerged(planetId: number, squadronId: number, intoSquadronId: number, fighterCount: number) {
        let sourceSquadron = this._galaxyHandler.squadrons[squadronId];
        let targetSquadron = this._galaxyHandler.squadrons[intoSquadronId];

        let fighters = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
        targetSquadron.fighters.push(fighters);

        Assert.equals(targetSquadron.fighters.length, fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${fighterCount}`);

        this.deleteSquadron(planetId, squadronId);
    }

    public squadronAttacks(planetId: number, squadronId: number) {
        let sentSquadron: Squadron = this._galaxyHandler.squadrons[squadronId];
        let planet = this._galaxyHandler.planets[planetId];
        planet.squadrons.push(sentSquadron);
    }

    public fighterDestroyed(planetId: number, squadronId: number, remainingFighterCount: number, bySquadronId: number) {
        let squadron = this._galaxyHandler.squadrons[squadronId];

        if (squadron) {
            squadron.fighters.splice(squadron.fighters.length - 2, 1);
            Assert.equals(squadron.fighters.length, remainingFighterCount, `Game::fighterDestroyed: Incorrect Fighter count client: ${squadron.fighters.length} server: ${remainingFighterCount}`);
        } else {
            console.error('Unknown squadron with id ' + squadronId);
        }
    }

    public planetConquered(factionId: number, planetId: number) {
        let faction = this._galaxyHandler.factions[factionId];
        let planet = this._galaxyHandler.planets[planetId];

        planet.faction = faction;
    }

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
