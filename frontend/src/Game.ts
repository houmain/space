'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { Engine } from './model/utils';
import { GameTimeHandler } from './model/gameTimeHandler';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from './communication/communicationHandler';
import { ServerMessageHandler } from './communication/messageHandler';
import { Galaxy } from './model/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';

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
        this.scene.add(States.MAIN, new Main(this, this._gameTimeHandler));
        this.scene.add(States.GAME, new GameScene(this, this._gameTimeHandler));
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
    }

    public get initialized(): boolean {
        return this._galaxy.planets.length > 0;
    }

    public resize(width: number, height: number) {
        console.log(`TODO: should resize to ${width} and ${height}`);
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