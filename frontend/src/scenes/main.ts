import { SpaceGame } from "../Game";

export class Main extends Phaser.Scene {

    private _game: SpaceGame;

    public constructor(game: SpaceGame) {
        super("main");
        this._game = game;
    }

    public create() {

        const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
        //  background.setOrigin()
        //background.setScale(15);

        this._game.galaxy.planets.forEach(planet => {
            let p = this.add.sprite(100, 100, 'planet');
            p.setScale(0.5);
        });

        // const music = this.sound.add('DOG');
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            /*if (!music.isPlaying) {
                music.play();
            }*/

            //background.setPosition(pointer.x, pointer.y);

            // this.cameras.main.setPosition(pointer.x, pointer.y);
        });

    }

    public update() {

    }
}
