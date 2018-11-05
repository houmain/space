import { Galaxy, Planet, Faction, Squadron } from '../../data/galaxyModels';
import { FactionInfo, PlanetInfo, SquadronInfo } from '../../communication/communicationInterfaces';
import { GalaxyObjectFactory } from './galaxyObjectFactory';

export class GalaxyFactory {

    public static create(galaxyObjectFactory: GalaxyObjectFactory, factionInfos: FactionInfo[], planetInfos: PlanetInfo[], squadronInfos: SquadronInfo[]): Galaxy {

        let galaxy = new Galaxy();

        let infoMap: { [id: number]: PlanetInfo; } = {};
        let planetMap: { [id: number]: Planet; } = {};
        let factionMap: { [id: number]: Faction; } = {};
        let factionColors: number[] = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];

        let factions: Faction[] = [];
        factionInfos.forEach((factionInfo, index) => {
            let faction = new Faction();
            faction.id = factionInfo.id;
            faction.name = factionInfo.name;
            faction.color = factionColors[index];
            faction.destroyed = false;
            factions.push(faction);
            factionMap[faction.id] = faction;
        });

        let planets: Planet[] = [];
        planetInfos.forEach(planetInfo => {

            infoMap[planetInfo.id] = planetInfo;

            let planet = new Planet();
            planet.id = planetInfo.id;
            planet.name = `Planet #${planetInfo.id}`;
            planet.distance = planetInfo.distance;
            planet.initialAngle = planetInfo.initialAngle;
            planet.angularVelocity = planetInfo.angularVelocity;
            planet.maxUpkeep = planetInfo.maxUpkeep;
            planet.productionRate = planetInfo.productionRate;
            planet.productionProgress = planetInfo.productionProgress;
            planet.defenseBonus = planetInfo.defenseBonus;
            planet.x = Math.cos(planet.initialAngle) * planet.distance;
            planet.y = Math.sin(planet.initialAngle) * planet.distance;

            if (planetInfo.faction) {
                planet.faction = factionMap[planetInfo.faction];
            }

            if (planetInfo.parent) {
                planet.parent = planetMap[planetInfo.parent];
            }

            if (planetInfo.squadrons) {
                planetInfo.squadrons.forEach(squadronInfo => {
                    let squadron: Squadron = galaxyObjectFactory.buildSquadron();
                    squadron.id = squadronInfo.squadronId;
                    squadron.faction = factionMap[squadronInfo.factionId];
                    squadron.planet = planet;
                    squadron.setPositon(planet.x, planet.y);

                    let fighterCount = squadronInfo.fighterCount;
                    for (let f = 0; f < fighterCount; f++) {
                        let fighter = galaxyObjectFactory.buildFighter();
                        fighter.setPositon(planet.x, planet.y);
                        fighter.orbitingAngle = f * 360 / fighterCount;
                        fighter.squadron = squadron;
                        squadron.fighters.push(fighter);
                    }

                    planet.squadrons.add(squadron.id, squadron);
                });
            }

            planets.push(planet);
            planetMap[planet.id] = planet;
        });

        let squadrons: Squadron[] = [];
        squadronInfos.forEach((squadronInfo, index) => {
            let squadron = galaxyObjectFactory.buildSquadron();
            squadron.id = squadronInfo.squadronId;
            squadron.planet = null;
            squadrons.push(squadron);
        });

        factions.forEach(faction => {
            galaxy.factions.push(faction);
        });

        planets.forEach(planet => {
            galaxy.planets.push(planet);
        });

        squadrons.forEach(squadron => {
            galaxy.squadrons.push(squadron);
        });

        return galaxy;
    }
}