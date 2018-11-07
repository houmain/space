import { Map } from '../common/collections';

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
    squadrons: Map<Squadron> = new Map<Squadron>();
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
    private _x: number = 0;
    private _y: number = 0;
    private _sprite: Phaser.GameObjects.Sprite = null;
    faction: Faction;
    fighters: Fighter[] = [];
    planet: Planet;
    speed: number = 0;

    public constructor() {
        Squadron.reset(this);
    }

    public setPositon(x: number, y: number) {
        this._x = x;
        this._y = y;
        if (this._sprite) {
            this._sprite.setPosition(x, y);
        }
    }

    public get x() {
        return this._x;
    }

    public get y() {
        return this._y;
    }

    public set sprite(sprite: Phaser.GameObjects.Sprite) {
        this._sprite = sprite;
        this._sprite.setPosition(this._x, this._y);
    }

    public get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }

    static reset(squadron: Squadron) {
        squadron.id = 0;
        squadron._x = 0;
        squadron._y = 0;
        squadron.faction = null;
        squadron.fighters.splice(0);
        squadron.planet = null;
        squadron._sprite = null;
        squadron.speed = 0;
    }
}

export class Fighter {


    static readonly FIGHTER_ORBITING_DISTANCE_PLANET = 30;
    static readonly FIGHTER_ORBITING_DISTANCE_MOVING = 10;

    private _x: number = 0;
    private _y: number = 0;
    private _sprite: Phaser.GameObjects.Sprite = null;
    orbitingAngle: number;
    orbitingDistance: number;
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

    public get sprite(): Phaser.GameObjects.Sprite {
        return this._sprite;
    }

    static reset(fighter: Fighter) {
        fighter._x = 0;
        fighter._y = 0;
        fighter._sprite = null;
        fighter.orbitingAngle = 0;
        fighter.orbitingDistance = Fighter.FIGHTER_ORBITING_DISTANCE_PLANET;
        fighter.squadron = null;
    }
}