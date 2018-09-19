import { Faction, Planet, Squadron, Galaxy } from '../data/galaxyModels';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessageFighterCreated, MessageFighterDestroyed, MessagePlanetConquered, ServerMessageType } from '../communication/communicationInterfaces';
import { Observer } from '../common/commonInterfaces';

export interface HandleFactionChanged {
	(faction: Faction): void;
}

class GalaxyDataHandlerObserver implements Observer {

	private _factionChangeSubscribers: { [factionId: number]: HandleFactionChanged[]; } = {};

	public subscribe(factionId: number, callback: HandleFactionChanged) {
		if (!this._factionChangeSubscribers[factionId]) {
			this._factionChangeSubscribers[factionId] = [];
		}
		this._factionChangeSubscribers[factionId].push(callback);
	}

	public unsubscribe(factionId: number, callback: HandleFactionChanged) {
		let index = this._factionChangeSubscribers[factionId].indexOf(callback);
		if (index !== -1) {
			this._factionChangeSubscribers[factionId].splice(index, 1);
		}
	}

	public onFactionChanged(faction: Faction) {

		let subscribers = this._factionChangeSubscribers[faction.id];

		if (subscribers) {
			try {
				subscribers.forEach(handle => {
					handle(faction);
				});
			} catch (e) {
				alert(e);
			}
		}
	}
}

export class GalaxyDataHandler implements Observer { //TODO Observer entfernen
	private _factions: { [id: number]: Faction; } = {};
	private _planets: { [id: number]: Planet; } = {};
	private _squadrons: { [id: number]: Squadron; } = {};

	private _observer: GalaxyDataHandlerObserver = new GalaxyDataHandlerObserver();

	public constructor() {

		//	serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		//	serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));
		//	serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
	}

	public init(galaxy: Galaxy) {

		galaxy.factions.forEach(faction => {
			this._factions[faction.id] = faction;
		});

		galaxy.planets.forEach(planet => {
			this._planets[planet.id] = planet;

			let faction: Faction = null;
			if (planet.faction) {
				faction = this._factions[planet.faction.id];
				faction.planets.push(planet);
				faction.maxUpkeep += planet.maxUpkeep;
			}
		});

		galaxy.squadrons.forEach(squadron => {
			this._squadrons[squadron.id] = squadron;

			if (squadron.faction) {
				let faction = this._factions[squadron.faction.id];

				faction.numFighters += squadron.fighters.length;
			}
		});
	}

	public get factions(): { [id: number]: Faction; } {
		return this._factions;
	}

	public get planets(): { [id: number]: Planet; } {
		return this._planets;
	}

	public get squadrons(): { [id: number]: Squadron; } {
		return this._squadrons;
	}

	public onFighterCreated(msg: MessageFighterCreated) {
		let squadron = this._squadrons[msg.squadronId];

		if (squadron.faction) {
			squadron.faction.numFighters++;

			this._observer.onFactionChanged(squadron.faction);
		}
	}

	public onFighterDestroyed(msg: MessageFighterDestroyed) {
		let squadron = this._squadrons[msg.squadronId];

		if (squadron.faction) {
			squadron.faction.numFighters--;

			this._observer.onFactionChanged(squadron.faction);
		}
	}

	public onPlanetConquered(msg: MessagePlanetConquered) {

		let planet = this._planets[msg.planetId];
		let oldFaction = this._factions[msg.fromFactionId];
		let newFaction = this._factions[msg.factionId];

		if (oldFaction) {
			oldFaction.maxUpkeep -= planet.maxUpkeep;
			oldFaction.planets.splice(oldFaction.planets.indexOf(planet), 1);
		}

		newFaction.maxUpkeep += planet.maxUpkeep;
		newFaction.planets.push(planet);

		this._observer.onFactionChanged(newFaction);
	}

	public subscribe(factionId: number, callback: HandleFactionChanged) {

		this._observer.subscribe(factionId, callback);

		this._observer.onFactionChanged(this._factions[factionId]);
	}

	public unsubscribe(factionId: number, callback: HandleFactionChanged) {
		this._observer.unsubscribe(factionId, callback);
	}
}

