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
    distance: number;
    initialAngle: number;
    angularVelocity: number;
    sprite: Phaser.GameObjects.Sprite;
    squadrons: Squadron[] = [];
    maxUpkeep: number;
    productionRate: number;
    productionProgress: number;
    defenseBonus: number;
}

export class Faction {
    id: number;
    color: number;
    destroyed: boolean = false;
    name: string;
}

export class Squadron {
    id: number;
    faction: Faction;
    fighters: Fighter[] = [];
}

export class Fighter {

}

