//"use strict"

import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { CommunicationHandler } from './model/communicationHandler';
import { Galaxy } from './model/galaxy';
import { MessageHandler } from './model/messageHandler';

export enum States {
    PRELOADER = 'preloader',
    MAIN = 'main'
}

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: MessageHandler;

    private _galaxy: Galaxy;

    public timeSinceStart: number;

    constructor(config: GameConfig) {
        super(config);

        this._messageHandler = new MessageHandler(this);
        this._communicationHandler = new CommunicationHandler(this._messageHandler);

        this.scene.add(States.PRELOADER, new Preloader(this, this._communicationHandler), true);
        this.scene.add(States.MAIN, new Main(this));

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

    const config: GameConfig = {
        type: Phaser.AUTO,
        parent: "canvas",
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
}