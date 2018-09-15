import { Planet, Squadron } from '../../data/galaxyModels';
import { Assets } from '../assets';
import { MessageFighterCreated, ServerMessageType, MessageFighterDestroyed, ServerMessage } from '../../communication/communicationInterfaces';
import { ObservableServerMessageHandler } from '../../communication/messageHandler';
import { PlanetUtils } from '../../logic/utils';

export class PlanetInfoBox extends Phaser.GameObjects.Container {

	private _serverMessageObserver: ObservableServerMessageHandler;

	private _selectedPlanets: Planet[];

	private _planetName: Phaser.GameObjects.BitmapText;
	private _numFighters: Phaser.GameObjects.BitmapText;

	private _factionId: number;

	public constructor(scene: Phaser.Scene, serverMessageObserver: ObservableServerMessageHandler, factionId: number) {
		super(scene, 0, 0);
		this._serverMessageObserver = serverMessageObserver;
		this._factionId = factionId;

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

	public updatePlanetsList(planets: Planet[]) {
		this._selectedPlanets = planets;
		this.updateInfoBox();
	}

	public subscribeEvents() {
		this._serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onServerMessage.bind(this));
		this._serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onServerMessage.bind(this));
	}

	public unsubscribeEvents() {
		this._serverMessageObserver.unsubscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onServerMessage.bind(this));
		this._serverMessageObserver.unsubscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onServerMessage.bind(this));
	}

	private onServerMessage(msg: ServerMessage) {
		this.updateInfoBox();
	}

	private updateInfoBox() {
		let planetName = '';
		let numFighters = 0;

		if (this._selectedPlanets.length === 1) {
			let planet = this._selectedPlanets[0];
			planetName = planet.name;
			numFighters = PlanetUtils.getNumFightersByFactionId(planet, this._factionId);
		} else if (this._selectedPlanets.length > 0) {
			planetName = `${this._selectedPlanets.length} planets`;
			this._selectedPlanets.forEach(planet => {
				numFighters += PlanetUtils.getNumFightersByFactionId(planet, this._factionId);
			});
		}

		this._planetName.setText(planetName);
		this._numFighters.setText(numFighters.toString());
	}
}