
import { States, SpaceGame } from '../Game';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from '../communication/communicationHandler';
import { SIGPROF } from 'constants';

export class Preloader extends Phaser.Scene {

    private _game: SpaceGame;
    private _gameConfig: SpaceGameConfig;
    private _communicationHandler: CommunicationHandler;
    private _clientMessageSender: ClientMessageSender;

    private _assetsLoaded: boolean = false;
    private _connectionFailed: boolean = false;

    public constructor(game: SpaceGame, gameConfig: SpaceGameConfig, communicationHandler: CommunicationHandler, clientMessageSender: ClientMessageSender) {
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
        this._gameConfig = gameConfig;
        this._communicationHandler = communicationHandler;
        this._clientMessageSender = clientMessageSender;

        this._communicationHandler.onConnectionEstablished = () => {
            console.log('connection established, joining game ...');
            this._clientMessageSender.joinGame(1);
        };

        this._communicationHandler.onDisconnected = () => {
            console.log('connection failed');
            this._connectionFailed = true;
        };
    }

    public preload() {

        this.showProgressBar();

        this.loadTextures();

        this._communicationHandler.init(this._gameConfig);
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

    private loadTextures() {

        this.load.setPath('./assets/');

        this.load.image('background', './images/background.png');
        this.load.image('planet', './images/planet_1.png');
        this.load.image('sun', './images/planet_13.png');
        this.load.image('pixel', './images/pixel.png');
    }

    public create() {
        this._assetsLoaded = true;
    }

    public update() {

        if (this._assetsLoaded) {
            if (this._game.initialized) {
                this.scene.start(States.MAIN);
                this.scene.start(States.HUD);
            } else if (this._connectionFailed) {
                this.scene.start(States.GAME);
                this.scene.start(States.HUD);
            }
        }
    }
}