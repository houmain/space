import 'phaser';
import { SpaceGame } from '../Game';
import { Camera } from '../model/camera';
import { GameTimeHandler } from '../model/gameTimeHandler';
import { SelectionHandler } from '../input/selectionHandler';
import { GameInfoHandler } from '../model/gameInfo';
import { Galaxy } from '../model/galaxyModels';
import { InputHandler } from '../input/inputHandler';
import { Background } from '../model/background';

export class Main extends Phaser.Scene {

    private _game: SpaceGame;
    private _galaxy: Galaxy;

    private _camera: Camera;

    private _inputHandler: InputHandler;
    private _timeHandler: GameTimeHandler;
    private _selectionHandler: SelectionHandler;

    private _gameInfoHandler: GameInfoHandler;

    private _graphics: Phaser.GameObjects.Graphics;

    public constructor(game: SpaceGame, timeHandler: GameTimeHandler) {
        super('main');
        this._game = game;
        this._timeHandler = timeHandler;
        this._gameInfoHandler = new GameInfoHandler(this);
    }

    public create() {

        this._inputHandler = new InputHandler(this);

        this._camera = new Camera(this.cameras.main);
        this._camera.setPosition(0, 0);
        //this.cameras.main.setPosition(100, 0);
        //  this.cameras.main.setBounds(-2048, -2048, 2048 * 2, 2048 * 2);
        this.cameras.main.setSize(2048, 2048);
        this._inputHandler.onDrag = this._camera.setPosition.bind(this._camera);

        //const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
        new Background(this).create();

        this._galaxy = this._game.galaxy;

        this._game.galaxy.planets.forEach(planet => {
            planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
            planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
            planet.sprite.setInteractive();
        });
        /*
                this.input.on('gameobjectdown', (p: any, o: Phaser.GameObjects.GameObject) => {
                    (o as Phaser.GameObjects.Sprite).setTint(0xff0000);
                });*/

        this._gameInfoHandler.addInfoText('Test');

        this._selectionHandler = new SelectionHandler(this, this.cameras.main, this._galaxy.planets);
        this._inputHandler.onSelectStart = this._selectionHandler.onStartSelect.bind(this._selectionHandler);
        this._inputHandler.onSelectEnd = this._selectionHandler.onEndSelect.bind(this._selectionHandler);
        this._inputHandler.onSelectedMouseMove = this._selectionHandler.onSelectPosChanged.bind(this._selectionHandler);

        this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000, alpha: 1 } });


    }

    public update(timeSinceStart: number, timeSinceLastFrame: number) {

        this._camera.update();

        this._timeHandler.addLocalElapsedTime(timeSinceLastFrame);
        let timeElapsed = this._timeHandler.timeSinceStart;

        this._galaxy.planets.forEach(planet => {
            let angle = planet.initialAngle + planet.angularVelocity * timeElapsed;
            planet.x = Math.cos(angle) * planet.distance;
            planet.y = Math.sin(angle) * planet.distance;
            if (planet.parent) {
                planet.x += planet.parent.x;
                planet.y += planet.parent.y;
            }

            planet.sprite.x = planet.x;
            planet.sprite.y = planet.y;
        });

        this._graphics.clear();

        this._galaxy.planets.forEach(planet => {
            if (planet.faction) {
                this._graphics.lineStyle(4, planet.faction.color, 1);

                this._graphics.strokeCircle(
                    planet.x,
                    planet.y,
                    30
                );
            }
        });

        this._selectionHandler.update();
    }
}
