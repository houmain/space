import { Scenes } from '../scenes';
import { GameLogicController } from '../../logic/controller/gameLogicController';
import { SpaceGame } from '../../Game';
import { GameInfoHandler } from '../../view/gameInfo';
import { Assets } from '../../view/assets';
import { GuiScene } from '../guiScene';
import { GameState } from '../../logic/data/gameState';
import { BuildGameInfo } from '../lobby/lobby';
import { GalaxyObjectFactory } from '../../logic/data/galaxyObjectFactory';
import { GalaxyFactory } from '../../logic/data/galaxyFactory';
import { GameEventObserverImpl } from '../../logic/event/gameEventObserver';

export class InitGameScene extends GuiScene {

	private _game: SpaceGame;
	private _gameState: GameState = null;
	private _buildGameInfo: BuildGameInfo;

	private _galaxyObjectfactory: GalaxyObjectFactory;
	private _gameInfoHandler: GameInfoHandler;

	public constructor(game: SpaceGame) {
		super(Scenes.INIT_GAME);
		this._game = game;
	}

	public init(data: any) {
		this._gameState = data.gameState;
		this._buildGameInfo = data.buildGameInfo;
	}

	public preload() {
		this.loadGameAssets();
	}

	private loadGameAssets() {
		this.load.setPath('./assets/');

		// Game
		this.load.image('background', './images/mainMenu.jpg');
		this.load.image('starfield', './images/starfield.png');
		this.load.image('planet', './images/planet_1.png');
		this.load.image('sun', './images/planet_13.png');
		this.load.image('pixel', './images/pixel.png');

		// Textureatlas
		this.load.atlas(Assets.ATLAS.HUD, './spritesheets/game_gui.png', './spritesheets/game_gui.json');
		this.load.atlas(Assets.ATLAS.GAME, './spritesheets/game.png', './spritesheets/game.json');
		this.load.atlas(Assets.ATLAS.PLANETS, './spritesheets/planets.png', './spritesheets/planets.json');
		this.load.atlas(Assets.ATLAS.FACTIONS, './spritesheets/factions.png', './spritesheets/factions.json');
		this.load.atlas(Assets.ATLAS.AVATARS, './spritesheets/avatars.png', './spritesheets/avatars.json');

		// fonts
		this.load.bitmapFont('gameHudCounter', './fonts/font_counter_-export.png', './fonts/font_counter_-export.xml');
		this.load.bitmapFont('gameHudText', './fonts/font_hud_text-export.png', './fonts/font_hud_text-export.xml');
		this.load.bitmapFont('infoText', './fonts/neuropol_18-export.png', './fonts/neuropol_18-export.xml');
		this.load.bitmapFont('gameInfo', './fonts/calibri_22-export.png', './fonts/calibri_22-export.xml');
	}

	public create() {
		super.create();

		this._galaxyObjectfactory = new GalaxyObjectFactory();
		let galaxy = GalaxyFactory.create(this._galaxyObjectfactory, this._buildGameInfo.factions, this._buildGameInfo.planets, this._buildGameInfo.movingSquadrons);
		let galaxyDataHandler = this._gameState.galaxyDataHandler;
		galaxyDataHandler.init(galaxy);

		let player = this._gameState.player;
		player.faction = galaxyDataHandler.factions.get(1); //TODO layer.playerId);

		new GameLogicController(player, galaxyDataHandler, this._gameState.gameEventObserver as GameEventObserverImpl, this._gameState.serverMessageQueue);
		this._gameInfoHandler = new GameInfoHandler(player, this._gameState.gameEventObserver);

		this.startGame();
	}

	private startGame() {
		this.scene.start(Scenes.GAME, {
			gameState: this._gameState
		});
		this.scene.start(Scenes.HUD, {
			player: this._gameState.player,
			gameInfoHandler: this._gameInfoHandler,
			gameEventObserver: this._gameState.gameEventObserver
		});
	}
}