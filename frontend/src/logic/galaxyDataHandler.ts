import { Faction, Planet, Squadron, Galaxy } from '../data/galaxyModels';
import { Assert } from '../common/utils';

export class GalaxyDataHandler {
	private _factions: { [id: number]: Faction; } = {};
	private _planets: { [id: number]: Planet; } = {};
	private _squadrons: { [id: number]: Squadron; } = {};

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

	public getSquadronById(id: number): Squadron {
		let squadron = this._squadrons[id];

		Assert.isNotNull(squadron, `No squadron found with id ${id}`);

		return squadron;
	}
}

