"use strict"

import 'phaser';
import { Preloader } from './scenes/Preloader';
import { Main } from './scenes/Main';
    
export class SpaceGame extends Phaser.Game{

    constructor(config: GameConfig) {
        super (config);
    }

    public resize(width: number, height: number){
        console.log(`TODO: should re4size to ${width} and ${height}`);
    }
}

function startGame(): void {

    const config: GameConfig = {
        type: Phaser.AUTO,
        parent: "canvas",
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [
            Preloader,
            Main
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
  
