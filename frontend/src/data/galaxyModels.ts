export class Galaxy {
    planets: Planet[] = [];
    factions: Faction[] = [];
    squadrons: Squadron[] = [];
}

export class Planet {
    id: number;
    name: string;
    parent: Planet;
    faction: Faction;
    x: number;
    y: number;
    distance: number = 0;
    initialAngle: number = 0;
    angularVelocity: number = 0;
    sprite: Phaser.GameObjects.Sprite;
    squadrons: Squadron[] = [];
    maxUpkeep: number = 0;
    productionRate: number = 0;
    productionProgress: number = 0;
    defenseBonus: number = 0;
}

export class Faction {
    id: number;
    color: number;
    destroyed: boolean = false;
    name: string;
    planets: Planet[] = [];
    numFighters: number = 0;
    maxUpkeep: number = 0;
}

export class Squadron {
    id: number;
    faction: Faction;
    fighters: Fighter[] = [];

    planet: Planet;
    sprite: Phaser.GameObjects.Sprite;
    x: number = 0;
    y: number = 0;
    orbitingAngle: number = 0;
    orbitingDistance: number = 100;
}

export class Fighter {

}

export class Player {
    public factionId: number;
}