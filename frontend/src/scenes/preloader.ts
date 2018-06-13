import { config } from '../config/preload';
import { CommunicationHandler } from '../model/communicationHandler';
import { States, SpaceGame } from '../Game';

export class Preloader extends Phaser.Scene {

    private _game: SpaceGame;
    private _communicationHandler: CommunicationHandler;

    public constructor(game: SpaceGame, communicationHandler: CommunicationHandler) {
        super({
            key: States.PRELOADER,
            pack: {
                files: [
                    { type: 'image', key: 'bar', url: './assets/images/loadBar.png' },
                    { type: 'image', key: 'barBg', url: './assets/images/barBg.png' }
                ]
            }
        });
        this._game = game;
        this._communicationHandler = communicationHandler;
    }

    public preload() {

        this.showProgressBar();

        // load assets declared in the preload config
        this.loadAtlas();
        this.loadTextures();

        this._communicationHandler.init();
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

    public create() {
        this._assetsLoaded = true;
    }

    private loadAtlas() {
        const sheetPath = config.ssPath;
        const sheets = config.sheets;

        this.load.setPath(sheetPath);

        for (let i = 0; i < sheets.length; i++) {
            this.load.atlas(sheets[i], `${sheets[i]}.png`, `${sheets[i]}.json`);
        }
    }

    private loadTextures() {
        this.load.image('background', '../images/background.png');
        this.load.image('planet', '../images/planet_1.png');
        this.load.image('sun', '../images/planet_13.png');
    }

    private _assetsLoaded: boolean = false;

    public update() {
        if (this._game.initialized && this._assetsLoaded) {
            this.scene.start(States.MAIN);
        }
    }
}