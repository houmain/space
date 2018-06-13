//https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

export class Galaxy {
    private _planets: Planet[] = [];
    private _factions: Faction[] = [];

    public get planets() {
        return this._planets;
    }

    public set planets(p: Planet[]) {
        this._planets = this.planets;
    }

}

export class Planet {
    private _name: string;
    private _position: any;
    private _id = 0;

    public constructor(id: number, name: string) {
        this._id = id;
        this._name = name;
    }

    public get name() {
        return this._name;
    }
}

export class Faction {

}



