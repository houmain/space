import { Planet, Squadron } from '../../data/galaxyModels';

export class PlanetUtils {

	public static getSquadronByFactionId(planet: Planet, factionId: number): Squadron {
		let squadron = null;
		let squadrons = planet.squadrons;
		for (let s = 0; s < squadrons.length; s++) {
			if (!squadrons[s].faction) {
				continue;
			}

			if (squadrons[s].faction.id === factionId) {
				squadron = squadrons[s];
				break;
			}
		}

		return squadron;
	}

	public static getNumFightersByFactionId(planet: Planet, factionId: number): number {
		let squadron = PlanetUtils.getSquadronByFactionId(planet, factionId);
		if (squadron) {
			return squadron.fighters.length;
		}
		return 0;
	}
}