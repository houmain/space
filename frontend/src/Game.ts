'use strict';

import 'phaser';

import { Preloader } from './scenes/preloader';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';
import { ErrorScene } from './scenes/error';
import { InitGameScene } from './scenes/initGame';
import { Scenes } from './scenes/scenes';
import { Engine } from './common/utils';
import { Player } from './data/gameData';
import { MainMenuScene } from './scenes/mainMenu';
import { BotMenuScene } from './scenes/botMenu';
import { BootScene } from './scenes/boot';
import { NinePatchPlugin } from '@koreez/phaser3-ninepatch';

export class SpaceGame extends Phaser.Game {

    private _player: Player;

    constructor(config: GameConfig) {
        super(config);

        Engine.init(this);

        this._player = new Player();

        this.scene.add(Scenes.BOOT, new BootScene(), true);
        this.scene.add(Scenes.PRELOADER, new Preloader());
        this.scene.add(Scenes.MAIN_MENU, new MainMenuScene());
        this.scene.add(Scenes.BOT_MENU, new BotMenuScene());
        this.scene.add(Scenes.INIT_GAME, new InitGameScene(this));
        this.scene.add(Scenes.GAME, new GameScene());
        this.scene.add(Scenes.HUD, new HudScene());
        this.scene.add(Scenes.ERROR, new ErrorScene());
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
        height: window.innerHeight,
        plugins: {
            global: [{ key: 'NinePatchPlugin', plugin: NinePatchPlugin, start: true }],
        },
    };

    const game = new SpaceGame(config);

    window.addEventListener('resize', function (event) {
        game.resize(window.innerWidth, window.innerHeight); //renderer.resize(window.innerWidth, window.innerHeight);
        game.events.emit('resize');
    }, false);
}
window.onload = () => {
    startGame();
};