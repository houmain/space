
import { SpaceGame } from '../Game';
import { Scenes } from './scenes';
import { Assets } from '../view/assets';

export class Preloader extends Phaser.Scene {

    private _assetsLoaded: boolean = false;

    public constructor(game: SpaceGame) {
        super({
            key: Scenes.PRELOADER,
            pack: {
                files: [
                    { type: 'image', key: 'bar', url: './assets/images/loadBar.png' },
                    { type: 'image', key: 'barBg', url: './assets/images/barBg.png' }
                ]
            }
        });
    }

    public preload() {

        this.showProgressBar();

        this.loadMainMenuAssets();
    }

    private showProgressBar() {
        const barBg = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'barBg');
        const bar = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'bar');

        const mask = this.make.graphics({
            x: bar.x - (bar.width / 2),
            y: bar.y - (bar.height / 2),
            add: false
        });
        mask.fillRect(0, 0, 0, bar.height);

        bar.mask = new Phaser.Display.Masks.GeometryMask(this, mask);

        this.load.on('progress', (progress: number) => {
            mask.clear();
            mask.fillRect(0, 0, bar.width * progress, bar.height);
        });
    }

    private loadMainMenuAssets() {
        this.load.setPath('./assets/');

        // Main Menu
        this.load.image('mainMenu', './images/mainMenu.jpg');
        this.load.atlas(Assets.ATLAS.MAIN_MENU, './spritesheets/gui.png', './spritesheets/gui.json');
    }

    public create() {
        this._assetsLoaded = true;
    }

    public update() {
        if (this._assetsLoaded) {
            this.scene.start(Scenes.MAIN_MENU);
        }
    }
}