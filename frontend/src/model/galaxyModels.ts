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
}

export class Faction {
    id: number;
    color: number;
    destroyed: boolean = false;
}

export class Squadron {
    id: number;
    faction: Faction;
    fighters: Fighter[] = [];
}

export class Fighter {

}