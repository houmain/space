//https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

import { Galaxy, Planet, Faction, Squadron, Fighter } from '../data/galaxyModels';
import { FactionInfo, PlanetInfo, SquadronInfo } from '../communication/communicationInterfaces';

export class GalaxyFactory {

    public static create(galaxy: Galaxy, factionInfos: FactionInfo[], planetInfos: PlanetInfo[], squadronInfos: SquadronInfo[]): Galaxy {

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

            if (planetInfo.faction) {
                planet.faction = factionMap[planetInfo.faction];
            }

            if (planetInfo.parent) {
                planet.parent = planetMap[planetInfo.parent];
            }

            if (planetInfo.squadrons) {
                planetInfo.squadrons.forEach(squadronInfo => {
                    let squadron: Squadron = new Squadron();
                    squadron.id = squadronInfo.squadronId;
                    squadron.faction = factionMap[squadronInfo.factionId];
                    let fighterCount = squadronInfo.fighterCount;
                    for (let f = 0; f < fighterCount; f++) {
                        squadron.fighters.push(new Fighter());
                    }
                    planet.squadrons.push(squadron);
                });
            }

            planets.push(planet);
            planetMap[planet.id] = planet;
        });

        let squadrons: Squadron[] = [];
        squadronInfos.forEach((squadronInfo, index) => {
            let squadron = new Squadron();
            squadron.id = squadronInfo.squadronId;
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





