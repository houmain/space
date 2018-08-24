'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Galaxy } from './data/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';
import { ErrorScene } from './scenes/error';
import { GalaxyDataHandler } from './logic/galaxyDataHandler';
import { InitGameScene } from './scenes/initGame';
import { Scenes } from './scenes/scenes';
import { Engine, Assert } from './common/utils';
import { Player } from './data/gameData';
import { MainMenuScene } from './scenes/mainMenu';

export class SpaceGame extends Phaser.Game {

    private _galaxy: Galaxy;
    private _galaxyHandler: GalaxyDataHandler;

    private _player: Player;

    constructor(config: GameConfig) {
        super(config);

        Engine.init(this);

        this._player = new Player();
        this._galaxy = new Galaxy();

        this.scene.add(Scenes.PRELOADER, new Preloader(this), true);
        this.scene.add(Scenes.MAIN_MENU, new MainMenuScene());
        this.scene.add(Scenes.INIT_GAME, new InitGameScene(this));
        this.scene.add(Scenes.GAME, new GameScene());
        this.scene.add(Scenes.HUD, new HudScene());
        this.scene.add(Scenes.ERROR, new ErrorScene());
    }

    public get galaxy(): Galaxy {
        return this._galaxy;
    }

    public get player(): Player {
        return this._player;
    }
}

function startGame(): void {

    const config = {
        type: Phaser.AUTO,
        parent: 'canvas',
        width: window.innerWidth,
        height: window.innerHeight
    };

    const game = new SpaceGame(config);

    window.addEventListener('resize', function (event) {
        game.renderer.resize(window.innerWidth, window.innerHeight);
        game.events.emit('resize');
    }, false);
}
window.onload = () => {
    console.log('Starting game');
    startGame();
};
