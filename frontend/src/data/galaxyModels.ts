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
    x: number = 0;
    y: number = 0;
    faction: Faction;
    fighters: Fighter[] = [];
    planet: Planet;
    sprite: Phaser.GameObjects.Sprite;

    public constructor() {
        Squadron.reset(this);
    }

    static reset(squadron: Squadron) {
        squadron.id = 0;
        squadron.x = 0;
        squadron.y = 0;
        squadron.faction = null;
        squadron.fighters.splice(0);
        squadron.planet = null;
        squadron.sprite = null;
    }
}

export class Fighter {
    private _x: number = 0;
    private _y: number = 0;
    private _sprite: Phaser.GameObjects.Sprite = null;
    orbitingAngle: number = 0;
    orbitingDistance: number = 100;
    squadron: Squadron;

    public constructor() {
        Fighter.reset(this);
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public setPositon(x: number, y: number) {
        this._x = x;
        this._y = y;
        if (this._sprite) {
            this._sprite.setPosition(x, y);
        }
    }

    public set sprite(sprite: Phaser.GameObjects.Sprite) {
        this._sprite = sprite;
        this._sprite.setPosition(this._x, this._y);
    }

    static reset(fighter: Fighter) {
        fighter._x = 0;
        fighter._y = 0;
        fighter._sprite = null;
        fighter.orbitingAngle = 0;
        fighter.orbitingDistance = 100;
        fighter.squadron = null;
    }
}