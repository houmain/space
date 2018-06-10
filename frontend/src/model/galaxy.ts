//https://gamedevacademy.org/create-a-basic-multiplayer-game-in-phaser-3-with-socket-io-part-2/

export class Galaxy {
    private _planets: Planet[] = [];
    private _factions: Faction[] = [];

    public constructor() {
        this._planets = [
            new Planet('Erde')
        ];

    }
}

export class Planet {
    private _name: string;
    private _position: any;

    public constructor(name: string) {
        this._name = name;
    }

    public get name() {
        return this._name;
    }
}

export class Faction {

}