import { SpaceGame } from '../Game';
import { Galaxy } from '../model/galaxy';
import { Camera } from '../model/camera';


export interface InputListenerCallback {
    (x: number, y: number): void;
}

export class InputHandler {

    private _dragging: boolean = false;

    public onDrag: InputListenerCallback;

    public constructor(scene: Phaser.Scene) {

        scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.onMouseDown(pointer);
        });

        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.onMouseUp(pointer);
        });

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.onMouseMove(pointer);
        });
    }

    private onMouseDown(pointer: Phaser.Input.Pointer) {
        this._dragging = true;
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        this._dragging = false;
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        if (this._dragging) {
            console.log('dragging ' + pointer.x);

            if (this.onDrag) {
                this.onDrag(pointer.x, pointer.y);
            }
        }
    }
}

export class Main extends Phaser.Scene {

    private _game: SpaceGame;
    private _galaxy: Galaxy;

    private _camera: Camera;

    private _inputHandler: InputHandler;

    public constructor(game: SpaceGame) {
        super('main');
        this._game = game;
    }

    public create() {

        this._inputHandler = new InputHandler(this);
        this._camera = new Camera(this.cameras.main);
        this._inputHandler.onDrag = this._camera.update.bind(this._camera);

        const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
        //  background.setOrigin()
        //background.setScale(15);

        this._galaxy = this._game.galaxy;

        this._game.galaxy.planets.forEach(planet => {
            planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
            planet.sprite.setScale(0.5);
        });

        this.input.on('drag', (pointer: Phaser.Input.Pointer) => {
            /*if (!music.isPlaying) {
                music.play();
            }*/

            //background.setPosition(pointer.x, pointer.y);

            // this.cameras.main.setPosition(pointer.x, pointer.y);
        });

        // const music = this.sound.add('DOG');
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            /*if (!music.isPlaying) {
                music.play();
            }*/

            //background.setPosition(pointer.x, pointer.y);

            //  this.cameras.main.setPosition(pointer.x, pointer.y);
            //console.log('pointerdown');
        });

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            console.log('pointerup');
            /*if (!music.isPlaying) {
                music.play();
            }*/

            //background.setPosition(pointer.x, pointer.y);

            //  this.cameras.main.setPosition(pointer.x, pointer.y);
        });

    }

    public update() {

        let timeSinceStart = this._game.timeSinceStart;

        this._galaxy.planets.forEach(planet => {
            let angle = planet.initialAngle + planet.angularVelocity * timeSinceStart;
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
