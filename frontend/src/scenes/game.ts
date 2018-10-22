import { Scenes } from './scenes';
import { InputHandler } from '../input/selectionHandler';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { ClientMessageSender } from '../communication/communicationHandler';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { GameSceneRenderer } from '../view/gameSceneRenderer';
import { GameSceneUpdater } from '../logic/controller/gameSceneUpdater';
import { GameEventObserver } from '../logic/event/eventInterfaces';

export class GameScene extends Phaser.Scene {

	private _camera: Phaser.Cameras.Scene2D.Camera;

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _inputHandler: InputHandler;
	private _timeController: GameTimeController;
	private _clientMessageSender: ClientMessageSender;
	private _serverMessageObserver: ObservableServerMessageHandler;
	private _gameEventObserver: GameEventObserver;

	private _gameRenderer: GameSceneRenderer;
	private _gameSceneUpdater: GameSceneUpdater;

	public constructor() {
		super(Scenes.GAME);
	}

	public init(data: any) {

		this._clientMessageSender = data.clientMessageSender;
		this._serverMessageObserver = data.serverMessageObserver;
		this._gameEventObserver = data.gameEventObserver;
		this._galaxyDataHandler = data.galaxyDataHandler;

		this._player = data.player;
	}

	public create() {

		this._timeController = new GameTimeController(this._serverMessageObserver);

		this._camera = this.cameras.main;
		this._camera.setBounds(-1024, -1024, 2048, 2048);
		this._camera.centerToBounds();

		this._gameSceneUpdater = new GameSceneUpdater(this._galaxyDataHandler);
		this._gameRenderer = new GameSceneRenderer(this,
			this._galaxyDataHandler,
			this._gameEventObserver);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();

		this._inputHandler = new InputHandler(this, this._player, this._galaxyDataHandler.planets.list, this._clientMessageSender);

		this._camera.fadeIn(1000);
	}

	private resize() {
		this._camera.setViewport(0, 0, window.innerWidth, window.innerHeight);
		this._camera.zoom = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
		this._camera.centerToBounds();
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {

		this._timeController.addLocalElapsedTime(timeSinceLastFrame);

		this._gameSceneUpdater.update(this._timeController.timeSinceStart, timeSinceLastFrame);

		this._gameRenderer.render();

		this._inputHandler.update();
	}

	public shutdown() {
		this.sys.game.events.off('resize', this.resize, this, true);
	}
}
