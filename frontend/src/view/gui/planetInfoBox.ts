import { Planet } from '../../data/galaxyModels';
import { Assets } from '../assets';
import { PlanetUtils } from '../../logic/utils/utils';
import { GameEventObserver, EventFighterCreated, GameEventType, EventFighterDestroyed, GameEvent } from '../../logic/event/eventInterfaces';
import { TextResources, Texts } from '../../localization/textResources';

export class PlanetInfoBox extends Phaser.GameObjects.Container {

	private _scene: Phaser.Scene;

	private _gameEventObserver: GameEventObserver;

	private _selectedPlanets: Planet[];

	private _planetName: Phaser.GameObjects.BitmapText;
	private _numFighters: Phaser.GameObjects.BitmapText;

	private _factionId: number;

	private _starsMaintainance: Phaser.GameObjects.Sprite[];
	private _starsProductivity: Phaser.GameObjects.Sprite[];
	private _starsDefense: Phaser.GameObjects.Sprite[];

	public constructor(scene: Phaser.Scene, gameEventObserver: GameEventObserver, factionId: number) {
		super(scene, 0, 0);
		this._scene = scene;
		this._gameEventObserver = gameEventObserver;
		this._factionId = factionId;

		let planetInfoBox = scene.add.sprite(0, 0, Assets.ATLAS.HUD, 'planetInfo.png');
		planetInfoBox.setOrigin(0, 0);
		planetInfoBox.setAlpha(0.35);
		this.add(planetInfoBox);

		let planet = scene.add.sprite(planetInfoBox.width / 2, 40, 'planet');
		planet.setScale(0.5);
		this.add(planet);

		this._planetName = scene.add.bitmapText(planetInfoBox.width / 2, 80, 'infoText', 'Planet #1');
		this._planetName.setOrigin(0.5);
		this.add(this._planetName);

		this.addLabel(planetInfoBox.width / 2, 110, TextResources.getText(Texts.GAME.FIGHTERS));
		this._numFighters = scene.add.bitmapText(planetInfoBox.width / 2 - 20, 120, 'gameHudCounter', '7', 32);
		this._numFighters.setOrigin(0, 0);
		this._numFighters.setTint(0x02a3dd);
		this.add(this._numFighters);

		this.addLabel(planetInfoBox.width / 2, 170, TextResources.getText(Texts.GAME.MAINTAINANCE));
		this._starsMaintainance = this.addStars(60, 200);
		this.addLabel(planetInfoBox.width / 2, 220, TextResources.getText(Texts.GAME.PRODUCTIVITY));
		this._starsProductivity = this.addStars(60, 250);
		this.addLabel(planetInfoBox.width / 2, 270, TextResources.getText(Texts.GAME.DEFENSE));
		this._starsDefense = this.addStars(60, 300);
	}

	private addLabel(x: number, y: number, label: string) {
		let text = this._scene.add.bitmapText(x, y, 'infoText', label, 16);
		text.setOrigin(0.5);
		this.add(text);
	}

	private addStars(x: number, y: number): Phaser.GameObjects.Sprite[] {
		let stars: Phaser.GameObjects.Sprite[] = [];
		const DISTANCE = 28;
		for (let s = 0; s < 5; s++) {
			let star = this._scene.add.sprite(x + s * DISTANCE, y, Assets.ATLAS.HUD, 'star_inactive.png');
			star.setScale(0.75);
			this.add(star);
			stars.push(star);
		}

		return stars;
	}

	public updatePlanetsList(planets: Planet[]) {
		this._selectedPlanets = planets;
		this.updateInfoBox();
	}

	public subscribeEvents() {
		this._gameEventObserver.subscribe<EventFighterCreated>(GameEventType.FIGHTER_CREATED, this.onGameEvent.bind(this));
		this._gameEventObserver.subscribe<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, this.onGameEvent.bind(this));
	}

	public unsubscribeEvents() {
		this._gameEventObserver.unsubscribe<EventFighterCreated>(GameEventType.FIGHTER_CREATED, this.onGameEvent.bind(this));
		this._gameEventObserver.unsubscribe<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, this.onGameEvent.bind(this));
	}

	private onGameEvent(event: GameEvent) {
		this.updateInfoBox();
	}

	private updateInfoBox() {
		let planetName = '';
		let numFighters = 0;
		let productivity = 0;
		let maintainance = 0;
		let defense = 0;

		if (this._selectedPlanets.length === 1) {
			let planet = this._selectedPlanets[0];
			planetName = planet.name;
			numFighters = PlanetUtils.getNumFightersByFactionId(planet, this._factionId);
			productivity = planet.productionRate;
			maintainance = planet.maxUpkeep;
			defense = planet.defenseBonus;
		} else if (this._selectedPlanets.length > 0) {
			planetName = `${this._selectedPlanets.length} planets`;
			this._selectedPlanets.forEach(planet => {

				numFighters += PlanetUtils.getNumFightersByFactionId(planet, this._factionId);
				productivity += planet.productionRate;
				maintainance += planet.maxUpkeep;
				defense += planet.defenseBonus;
			});

			productivity /= this._selectedPlanets.length;
			maintainance /= this._selectedPlanets.length;
			defense /= this._selectedPlanets.length;
		}

		this._planetName.setText(planetName);
		this._numFighters.setText(numFighters.toString());

		this.updateStars(this._starsProductivity, this.getNumActiveProductivityStars(productivity));
		this.updateStars(this._starsMaintainance, this.getNumActiveMaintainanceStars(maintainance));
		this.updateStars(this._starsDefense, this.getNumActiveDefenseStars(defense));
	}

	private updateStars(stars: Phaser.GameObjects.Sprite[], numActive: number) {
		stars.forEach((star, index) => {
			star.setFrame(index < numActive ? 'star_active.png' : 'star_inactive.png');
		});
	}

	private getNumActiveProductivityStars(productivity: number): number {
		return Math.floor(productivity / 0.15);
	}

	private getNumActiveMaintainanceStars(maintainance: number): number {
		return Math.floor(maintainance / 10);
	}

	private getNumActiveDefenseStars(defense: number): number {
		return Math.floor(defense / 0.1);
	}
}