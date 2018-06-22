//https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

import { Galaxy, Planet, Faction } from './galaxyModels';
import { FactionInfo, PlanetInfo } from '../communication/communicationInterfaces';

export class GalaxyFactory {

    public static create(factionInfos: FactionInfo[], planetInfos: PlanetInfo[]): Galaxy {

        let infoMap: { [id: number]: PlanetInfo; } = {};
        let planetMap: { [id: number]: Planet; } = {};
        let factionMap: { [id: number]: Faction; } = {};

        let factions: Faction[] = [];
        factionInfos.forEach(factionInfo => {
            let faction = new Faction();
            faction.id = factionInfo.id;
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

            if (planetInfo.owner) {
                planet.faction = factionMap[planetInfo.owner];
            }

            if (planetInfo.parent) {
                planet.parent = planetMap[planetInfo.parent];
            }

            planets.push(planet);
            planetMap[planet.id] = planet;
        });

        let galaxy = new Galaxy();

        factions.forEach(faction => {
            galaxy.factions.push(faction);
        });

        planets.forEach(planet => {
            galaxy.planets.push(planet);
        });

        return galaxy;
    }
}




