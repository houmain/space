import { Faction, Planet, Squadron, Galaxy } from '../data/galaxyModels';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessageFighterCreated, MessageFighterDestroyed, MessagePlanetConquered, ServerMessageType } from '../communication/communicationInterfaces';

export class GalaxyDataHandler {
	private _factions: { [id: number]: Faction; } = {};
	private _planets: { [id: number]: Planet; } = {};
	private _squadrons: { [id: number]: Squadron; } = {};

	public constructor(serverMessageObserver: ObservableServerMessageHandler) {

		serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));
		serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
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

			let squadrons = planet.squadrons;

			squadrons.forEach(squadron => {
				this._squadrons[squadron.id] = squadron;

				if (faction) {
					faction.numFighters += squadron.fighters.length;
				}
			});
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

	private onFighterCreated(msg: MessageFighterCreated) {
		let squadron = this._squadrons[msg.squadronId];

		if (squadron.faction) {
			squadron.faction.numFighters++;
		}
	}

	private onFighterDestroyed(msg: MessageFighterDestroyed) {
		let squadron = this._squadrons[msg.squadronId];

		if (squadron.faction) {
			squadron.faction.numFighters--;
		}
	}

	private onPlanetConquered(msg: MessagePlanetConquered) {

		let planet = this._planets[msg.planetId];
		let oldFaction = planet.faction;
		let newFaction = this._factions[msg.factionId];

		if (oldFaction) {
			oldFaction.maxUpkeep -= planet.maxUpkeep;
			oldFaction.planets.splice(oldFaction.planets.indexOf(planet), 1);
		}

		newFaction.maxUpkeep += planet.maxUpkeep;
		newFaction.planets.push(planet);
	}
}