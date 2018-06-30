import { SpaceGame } from '../Game';
import { Camera } from '../model/camera';
import { InputHandler } from '../input/inputHandler';
import { GameTimeHandler } from '../model/gameTimeHandler';
import { SelectionHandler } from '../input/selectionHandler';
import { GameInfoHandler } from '../model/gameInfo';
import { Planet, Galaxy } from '../model/galaxyModels';
import { Background } from '../model/background';

export class GameScene extends Phaser.Scene {

	private _game: SpaceGame;

	private _camera: Camera;

	private _inputHandler: InputHandler;
	private _timeHandler: GameTimeHandler;
	private _selectionHandler: SelectionHandler;

	private _gameInfoHandler: GameInfoHandler;

	private _galaxy: Galaxy;

	public constructor(game: SpaceGame, timeHandler: GameTimeHandler) {
		super('game');
		this._game = game;
		this._timeHandler = timeHandler;
		this._gameInfoHandler = new GameInfoHandler(this);
	}

	public create() {

		this._inputHandler = new InputHandler(this);

		this._camera = new Camera(this.cameras.main);
		this._inputHandler.onDrag = this._camera.setPosition.bind(this._camera);

		//const background = this.add.sprite(0, 0, 'background');
		new Background(this).create();

		this._gameInfoHandler.addInfoText('Test');

		this._galaxy = new Galaxy();
		let sun = new Planet();
		sun.x = 300;
		sun.y = 300;
		sun.initialAngle = 0;
		sun.angularVelocity = 0;

		let p1 = new Planet();
		p1.name = 'P1';
		p1.x = 600;
		p1.y = 600;
		p1.initialAngle = 0;
		p1.parent = sun;
		p1.angularVelocity = 0.001;
		p1.distance = 0.001;

		let p2 = new Planet();
		p2.name = 'P1';
		p2.x = 200;
		p2.y = 200;
		p2.initialAngle = 2;
		p2.parent = sun;
		p2.angularVelocity = 0.001;
		p2.distance = 0.001;

		this._galaxy.planets = [sun, p1, p2];

		this._galaxy.planets.forEach(planet => {
			planet.sprite = this.add.sprite(planet.x, planet.y, planet.parent ? 'planet' : 'sun');
			planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
			planet.sprite.setInteractive();
		});

		this._selectionHandler = new SelectionHandler(this, this.cameras.main, this._galaxy.planets);
		this._inputHandler.onSelectStart = this._selectionHandler.onStartSelect.bind(this._selectionHandler);
		this._inputHandler.onSelectEnd = this._selectionHandler.onEndSelect.bind(this._selectionHandler);
		this._inputHandler.onSelectedMouseMove = this._selectionHandler.onSelectPosChanged.bind(this._selectionHandler);
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {

		this._camera.update();

		this._timeHandler.addLocalElapsedTime(timeSinceLastFrame);
		let timeElapsed = this._timeHandler.timeSinceStart;
		/*
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
		*/
		this._selectionHandler.update();
	}
}
