export class Galaxy {
    planets: Planet[] = [];
    factions: Faction[] = [];
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
}

export class Faction {
    id: number;
    color: number;
}