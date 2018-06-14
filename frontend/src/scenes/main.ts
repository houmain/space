import { SpaceGame } from "../Game";
import { Galaxy } from "../model/galaxy";

export class Main extends Phaser.Scene {

    private _game: SpaceGame;
    private _galaxy: Galaxy;

    public constructor(game: SpaceGame) {
        super("main");
        this._game = game;
    }

    public create() {

        const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
        //  background.setOrigin()
        //background.setScale(15);

        this._galaxy = this._game.galaxy;

        this._game.galaxy.planets.forEach(planet => {
            planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
            planet.sprite.setScale(0.5);
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
        /*
        void Game::update_planet_positions(double time_since_start) {
          for (auto& planet : m_planets) {
            const auto angle = planet.initial_angle +
                planet.angular_velocity * time_since_start;
            planet.x = std::cos(angle) * planet.distance;
            planet.y = std::sin(angle) * planet.distance;
            if (planet.parent) {
              planet.x += planet.parent->x;
              planet.y += planet.parent->y;
            }
          }
        }
        */
    }
}
