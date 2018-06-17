import { SpaceGame } from '../Game';
import { Galaxy } from '../model/galaxy';
import { Camera } from '../model/camera';
import { InputHandler } from '../model/inputHandler';
import { GameTimeHandler } from '../model/gameTimeHandler';

export class Main extends Phaser.Scene {

    private _game: SpaceGame;
    private _galaxy: Galaxy;

    private _camera: Camera;

    private _inputHandler: InputHandler;
    private _timeHandler: GameTimeHandler;

    public constructor(game: SpaceGame, timeHandler: GameTimeHandler) {
        super('main');
        this._game = game;
        this._timeHandler = timeHandler;
    }

    public create() {

        this._inputHandler = new InputHandler(this);
        this._camera = new Camera(this.cameras.main);
        this._inputHandler.onDrag = this._camera.setPosition.bind(this._camera);

        const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');

        this._galaxy = this._game.galaxy;

        this._game.galaxy.planets.forEach(planet => {
            planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
            planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
            planet.sprite.setInteractive();
        });


        this.input.on('gameobjectdown', (p: any, o: Phaser.GameObjects.GameObject) => {
            (o as Phaser.GameObjects.Sprite).setTint(0xff0000);
        });
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

            planet.sprite.x = planet.x + 400;
            planet.sprite.y = planet.y + 400;
        });
    }
}
