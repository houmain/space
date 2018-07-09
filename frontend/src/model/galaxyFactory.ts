//https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

import { Galaxy, Planet, Faction } from './galaxyModels';
import { FactionInfo, PlanetInfo } from '../communication/communicationInterfaces';

export class GalaxyFactory {

    public static create(factionInfos: FactionInfo[], planetInfos: PlanetInfo[]): Galaxy {

        let infoMap: { [id: number]: PlanetInfo; } = {};
        let planetMap: { [id: number]: Planet; } = {};
        let factionMap: { [id: number]: Faction; } = {};
        let factionColors: number[] = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00,]

        let factions: Faction[] = [];
        factionInfos.forEach((factionInfo, index) => {
            let faction = new Faction();
            faction.id = factionInfo.id;
            faction.color = factionColors[index];
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

            if (planetInfo.faction) {
                planet.faction = factionMap[planetInfo.faction];
            }

            if (planetInfo.parent) {
                planet.parent = planetMap[planetInfo.parent];
            }

            planets.push(planet);
            planetMap[planet.id] = planet;
        });

        planets[0].x = 400;
        planets[0].y = 400;

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





