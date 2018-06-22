'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { Engine } from './model/utils';
import { GameTimeHandler } from './model/gameTimeHandler';
import { CommunicationHandler, ClientMessageHandler } from './communication/communicationHandler';
import { ServerMessageHandler } from './communication/messageHandler';
import { Galaxy } from './model/galaxyModels';

export enum States {
    PRELOADER = 'preloader',
    MAIN = 'main'
}

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: ServerMessageHandler;
    private _gameTimeHandler: GameTimeHandler;
    private _clientMessageHandler: ClientMessageHandler;

    private _galaxy: Galaxy;

    constructor(config: GameConfig) {
        super(config);

        Engine.init(this);

        this._gameTimeHandler = new GameTimeHandler();
        this._messageHandler = new ServerMessageHandler(this);
        this._communicationHandler = new CommunicationHandler(this._messageHandler);
        this._clientMessageHandler = new ClientMessageHandler(this._communicationHandler);

        this._messageHandler.onMessageHandlerServerTimeUpdate = this._gameTimeHandler.updateServerTime.bind(this._gameTimeHandler);

        this.scene.add(States.PRELOADER, new Preloader(this, this._communicationHandler), true);
        this.scene.add(States.MAIN, new Main(this, this._gameTimeHandler));

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
        console.log(this._galaxy.planets.length);
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