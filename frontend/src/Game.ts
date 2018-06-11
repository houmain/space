"use strict"

import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { CommunicationHandler, MessageHandler } from './model/communicationHandler';

export enum States {
    PRELOADER = 'preloader',
    MAIN = 'main'
}

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _messageHandler: MessageHandler;

    constructor(config: GameConfig) {
        super(config);

        this._messageHandler = new MessageHandler();
        this._communicationHandler = new CommunicationHandler(this._messageHandler);

        this.scene.add(States.PRELOADER, new Preloader(this._communicationHandler), true);
        this.scene.add(States.MAIN, new Main());
    }

    public get communcationHandler(): CommunicationHandler {
        return this._communicationHandler;
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