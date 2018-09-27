import { Faction, Planet, Squadron, Galaxy } from '../../data/galaxyModels';
import { Map } from '../../common/collections';

export class GalaxyDataHandler {

	private _factions: Map<Faction> = new Map<Faction>();
	private _planets: Map<Planet> = new Map<Planet>();
	private _squadrons: Map<Squadron> = new Map<Squadron>();

	public init(galaxy: Galaxy) {

		galaxy.factions.forEach(faction => {
			this._factions.add(faction.id, faction);
		});

		galaxy.planets.forEach(planet => {
			this._planets.add(planet.id, planet);

			planet.squadrons.forEach(squadron => {
				this._squadrons.add(squadron.id, squadron);
			});
		});

		galaxy.squadrons.forEach(squadron => {
			this._squadrons.add(squadron.id, squadron);
		});

		this.updateFactionStats();
	}

	public get initialized() {
		return this._planets.list.length > 0;
	}

	public get factions(): Map<Faction> {
		return this._factions;
	}

	public get planets(): Map<Planet> {
		return this._planets;
	}

	public get squadrons(): Map<Squadron> {
		return this._squadrons;
	}

	private updateFactionStats() {
		let planets = this._planets.list;

		planets.forEach(planet => {

			if (planet.faction) {
				let planetFaction = this._factions.get(planet.faction.id);
				planetFaction.planets.push(planet);
				planetFaction.maxUpkeep += planet.maxUpkeep;
			}
		});

		let squadrons = this._squadrons.list;
		squadrons.forEach(squadron => {

			if (squadron.faction) {
				let squadronFaction = this._factions.get(squadron.faction.id);
				squadronFaction.numFighters += squadron.fighters.length;
			}
		});
	}
}

