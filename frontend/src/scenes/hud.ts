import { GameInfoHandler } from '../view/gameInfo';
import { Player } from '../data/gameData';
import { GalaxyDataHandler } from '../logic/galaxyDataHandler';
import { Scenes } from './scenes';
import { PlayerHud } from '../view/playerHud';
import { Assets } from '../view/assets';
import { Planet } from '../data/galaxyModels';

export class ImageButton extends Phaser.GameObjects.Container {
	public onClick: Function = null;

	public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
		super(scene, x, y);

		let button = scene.add.image(0, 0, texture, frame);

		let hitarea = new Phaser.Geom.Circle(50, 50, 20);
		button.setInteractive({
			hitArea: hitarea,
			//	hitAreaCallback: Phaser.Geom.Circle.Contains,
			cursor: 'pointer'
		});
		button.on('pointerover', () => {
			button.setTint(0x666666);
		});
		button.on('pointerout', () => {
			button.setTint(0xffffff);
			button.setScale(1);
		});
		button.on('pointerdown', () => {
			button.setTint(0x333333);
			button.setScale(0.9);
			if (this.onClick) {
				this.onClick();
			}
		});
		button.on('pointerup', () => {
			button.setTint(0xffffff);
			button.setScale(1);
		});

		this.add(button);
	}
}

export class PlanetInfoBox extends Phaser.GameObjects.Container {

	private _planetName: Phaser.GameObjects.BitmapText;
	private _numFighters: Phaser.GameObjects.BitmapText;

	public constructor(scene: Phaser.Scene) {
		super(scene, 0, 0);

		let planetInfoBox = scene.add.sprite(0, 0, Assets.ATLAS.HUD, 'planetInfo.png');
		planetInfoBox.setOrigin(0, 0);
		planetInfoBox.setAlpha(0.25);

		let planet = scene.add.sprite(planetInfoBox.width / 2, 40, 'planet');
		planet.setScale(0.5);

		this._planetName = scene.add.bitmapText(planetInfoBox.width / 2, 80, 'infoText', 'Planet #1');
		this._planetName.setOrigin(0.5);

		let fighters = scene.add.bitmapText(planetInfoBox.width / 2, 120, 'infoText', 'fighters', 16);
		fighters.setOrigin(0.5);

		this._numFighters = scene.add.bitmapText(planetInfoBox.width / 2 - 20, 130, 'gameHudCounter', '7', 32);
		this._numFighters.setOrigin(0, 0);
		this._numFighters.setTint(0x02a3dd);

		let maintainance = scene.add.bitmapText(planetInfoBox.width / 2, 180, 'infoText', 'maintainance', 16);
		maintainance.setOrigin(0.5);

		let productivity = scene.add.bitmapText(planetInfoBox.width / 2, 240, 'infoText', 'productivity', 16);
		productivity.setOrigin(0.5);

		this.add(planetInfoBox);
		this.add(planet);
		this.add(this._planetName);
		this.add(this._numFighters);
		this.add(fighters);
		this.add(maintainance);
		this.add(productivity);

		for (let s = 0; s < 5; s++) {
			let star = scene.add.sprite(60 + s * 28, 210, Assets.ATLAS.HUD, s < 4 ? 'star_active.png' : 'star_inactive.png');
			star.setScale(0.75);
			this.add(star);
		}

		for (let s = 0; s < 5; s++) {
			let star = scene.add.sprite(60 + s * 28, 270, Assets.ATLAS.HUD, s < 2 ? 'star_active.png' : 'star_inactive.png');
			star.setScale(0.75);
			this.add(star);
		}
	}

	private _selectedPlanets: Planet[];

	public setPlanets(planets: Planet[]) {
		this._selectedPlanets = planets;

		if (planets.length === 1) {
			let planet = planets[0];
			this._planetName.setText(planet.name);
			let ownerFaction = planet.faction;
			this._numFighters.setText(planet.squadrons[0].fighters.length + '');
		}
	}
}

export class HudScene extends Phaser.Scene {

	private _player: Player;
	private _galaxyDataHandler: GalaxyDataHandler;

	private _gameInfoHandler: GameInfoHandler;
	private _playerHud: PlayerHud;
	private _planetInfoBox: PlanetInfoBox;

	public constructor() {
		super(Scenes.HUD);
	}

	public init(data: any) {

		let gameState = data.gameState;

		this._player = gameState.player;
		this._galaxyDataHandler = data.galaxyDataHandler;
		this._gameInfoHandler = data.gameInfoHandler;
	}

	public create() {
		this._gameInfoHandler.create(this);

		this._playerHud = new PlayerHud();
		this._playerHud.create(this, this._galaxyDataHandler, this._player);

		this._planetInfoBox = new PlanetInfoBox(this);
		this.add.existing(this._planetInfoBox);

		this.sys.game.events.on('resize', this.resize, this);
		this.resize();

		let b = new ImageButton(this, window.innerWidth - 50, 50, Assets.ATLAS.HUD, 'menu_icon.png');
		b.onClick = () => {
			console.log('click');
		};
		b.setScale(1.5);

		this.add.existing(b);

		var gameScene = this.scene.get(Scenes.GAME);
		gameScene.events.on('planetsSelected', (planets: Planet[]) => {
			this._planetInfoBox.setPlanets(planets);
		});
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		this._gameInfoHandler.update(timeSinceLastFrame);
	}

	private resize() {
		//	let cam = this.cameras.main;
		//	cam.setViewport(0, 0, window.innerWidth, window.innerHeight);
		//	cam.centerToBounds();

		let bounds = this._planetInfoBox.getBounds();
		this._planetInfoBox.setPosition(window.innerWidth - bounds.width - 10, window.innerHeight - bounds.height - 10);
		//cam.zoom = Math.min(window.innerWidth / 1024, window.innerHeight / 768);
	}
}