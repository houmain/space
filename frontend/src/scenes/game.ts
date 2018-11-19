import { Scenes } from './scenes';
import { InputHandler } from '../input/selectionHandler';
import { GameTimeController } from '../logic/controller/gameTimeController';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { GameSceneRenderer } from '../view/gameSceneRenderer';
import { GameSceneUpdater } from '../logic/controller/gameSceneUpdater';
import { GameEventObserver, SceneEvents } from '../logic/event/eventInterfaces';
import { TextResources, Texts } from '../localization/textResources';
import { Planet } from '../data/galaxyModels';
import { ClientMessageSender } from '../communication/clientMessageSender';

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
		this._gameSceneUpdater.init();

		this._gameRenderer = new GameSceneRenderer(this,
			this._galaxyDataHandler,
			this._gameEventObserver);

		let hudScene = this.scene.get(Scenes.HUD);
		hudScene.events.on(SceneEvents.CLICKED_ON_INFO, (planet: Planet) => {
			let cam: any = this.cameras.main;
			cam.centerOn(planet.x, planet.y);
		});

		this.sys.game.events.on(SceneEvents.DISCONNECTED, this.onDisconnected, this);
		this.sys.game.events.on(SceneEvents.RESIZE, this.resize, this);
		this.resize();

		this._inputHandler = new InputHandler(this, this._player, this._galaxyDataHandler.planets.list, this._clientMessageSender);

		this._camera.fadeIn(1000);
	}

	private onDisconnected() {

		let infoText = this.add.bitmapText(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'font_8', TextResources.getText(Texts.INIT_GAME.JOINING_GAME));
		infoText.setOrigin(0.5, 0.5);
		infoText.text = TextResources.getText(Texts.ERROR.CONNECTION_FAILED);
		infoText.setTint(0xff0000);
		infoText.setAlpha(0);

		this.tweens.add({
			targets: infoText,
			alpha: 1,
			ease: 'Power1',
			duration: 300,
			yoyo: true,
			repeat: 5,
			onComplete: () => {
				this.scene.start(Scenes.MAIN_MENU);
			}
		});
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
		this.sys.game.events.off(SceneEvents.RESIZE, this.resize, this, true);
	}
}
