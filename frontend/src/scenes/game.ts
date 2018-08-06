import { States } from './states';
import { InputHandler } from '../input/inputHandler';
import { SelectionHandler } from '../input/selectionHandler';
import { GameTimeHandler } from '../logic/gameTimeHandler';
import { ClientMessageSender } from '../communication/communicationHandler';
import { Galaxy, Player } from '../data/galaxyModels';
import { Camera } from '../view/camera';
import { GameInfoHandler } from '../view/gameInfo';
import { Background } from '../view/background';

export class GameScene extends Phaser.Scene {

	private _camera: Camera;

	private _galaxy: Galaxy;
	private _player: Player;

	private _inputHandler: InputHandler;
	private _selectionHandler: SelectionHandler;
	private _gameInfoHandler: GameInfoHandler;
	private _timeHandler: GameTimeHandler;
	private _clientMessageSender: ClientMessageSender;

	private _graphics: Phaser.GameObjects.Graphics;

	public constructor(timeHandler: GameTimeHandler, clientMessageSender: ClientMessageSender) {
		super(States.GAME);

		this._timeHandler = timeHandler;
		this._clientMessageSender = clientMessageSender;
	}

	public init(data: any) {

		let gameState = data.gameState;
		let gameLogic = data.gameLogic;

		this._galaxy = gameState.galaxy;
		this._player = gameState.player;
	}

	public create() {

		this._inputHandler = new InputHandler(this);
		this._gameInfoHandler = new GameInfoHandler(this);

		this._camera = new Camera(this.cameras.main);
		this.cameras.main.setSize(2048, 2048);
		this._inputHandler.onDrag = this._camera.setDeltaPosition.bind(this._camera);

		new Background(this).create();

		this._galaxy.planets.forEach(planet => {
			planet.sprite = this.add.sprite(0, 0, planet.parent ? 'planet' : 'sun');
			planet.sprite.setScale(planet.parent ? 0.25 : 0.35);
			planet.sprite.setInteractive();
			planet.sprite.on('pointerdown', () => {
				this._selectionHandler.selectPlanet(planet);
			});
		});

		this._gameInfoHandler.addInfoText('Test Fighters 10/20');

		this._selectionHandler = new SelectionHandler(this, this.cameras.main, this._player, this._galaxy.planets, this._clientMessageSender);
		this._inputHandler.onSelectStart = this._selectionHandler.onStartSelect.bind(this._selectionHandler);
		this._inputHandler.onSelectEnd = this._selectionHandler.onEndSelect.bind(this._selectionHandler);
		this._inputHandler.onSelectedMouseMove = this._selectionHandler.onSelectPosChanged.bind(this._selectionHandler);

		this._graphics = this.add.graphics({ lineStyle: { width: 2, color: 0xff0000, alpha: 1 } });
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {

		this._camera.update(timeSinceLastFrame);

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