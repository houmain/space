'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { Engine } from './model/utils';
import { GameTimeHandler } from './model/gameTimeHandler';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from './communication/communicationHandler';
import { ServerMessageHandler } from './communication/messageHandler';
import { Galaxy, Planet, Faction, Squadron } from './model/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';

export enum States {
    PRELOADER = 'preloader',
    MAIN = 'main',
    GAME = 'game',
    HUD = 'hud'
}

class GalaxyHelper {
    private _factions: { [id: number]: Faction; } = {};
    private _planets: { [id: number]: Planet; } = {};
    private _squadrons: { [id: number]: Squadron; } = {};

    public init(galaxy: Galaxy) {

        galaxy.planets.forEach(planet => {
            this._planets[planet.id] = planet;
        });

        galaxy.factions.forEach(faction => {
            this._factions[faction.id] = faction;
        });
    }

    public get factions(): { [id: number]: Faction; } {
        return this._factions;
    }

    public get planets(): { [id: number]: Planet; } {
        return this._planets;
    }

    public get squadrons(): { [id: number]: Squadron; } {
        return this._squadrons;
    }
}

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: ServerMessageHandler;
    private _gameTimeHandler: GameTimeHandler;
    private _clientMessageSender: ClientMessageSender;

    private _galaxy: Galaxy;
    private _galaxyHelper: GalaxyHelper;

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

        this._galaxy = new Galaxy();

    }

    public get communcationHandler(): CommunicationHandler {
        return this._communicationHandler;
    }

    public get galaxy(): Galaxy {
        return this._galaxy;
    }

    public initGalaxy(galaxy: Galaxy) {
        this._galaxy = galaxy;
        this._galaxyHelper = new GalaxyHelper();
        this._galaxyHelper.init(this._galaxy);
    }

    public get initialized(): boolean {
        return this._galaxy.planets.length > 0;
    }

    public resize(width: number, height: number) {
        console.log(`TODO: should resize to ${width} and ${height}`);
    }

    public createFighter(planetId: number, squadronId: number, fighterCount: number) {

    }

    public squadronSent(sourcePlanetId: number, factionId: number, targetPlanetId: number,
        squadronId: number, fighterCount: number) {

        if (this._galaxyHelper.squadrons[squadronId] === null) {
            // create squadron
            let squadron: Squadron = new Squadron();
            squadron.id = squadronId;
            squadron.faction = this._galaxyHelper.factions[factionId];
            // squadron.fighters.sp
        }
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
