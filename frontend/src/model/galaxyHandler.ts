import { Faction, Planet, Squadron, Galaxy } from './galaxyModels';

export class GalaxyHandler {
	private _factions: { [id: number]: Faction; } = {};
	private _planets: { [id: number]: Planet; } = {};
	private _squadrons: { [id: number]: Squadron; } = {};

	public init(galaxy: Galaxy) {

		galaxy.factions.forEach(faction => {
			this._factions[faction.id] = faction;
		});

		galaxy.planets.forEach(planet => {
			this._planets[planet.id] = planet;

			let squadrons = planet.squadrons;

			squadrons.forEach(squadron => {
				this._squadrons[squadron.id] = squadron;
			});
		});

		galaxy.squadrons.forEach(squadron => {
			this._squadrons[squadron.id] = squadron;
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
}