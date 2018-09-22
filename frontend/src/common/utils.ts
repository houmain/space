export class Engine {

    private static _instance: Phaser.Game;

    public static init(phaserEngine: Phaser.Game) {
        Engine._instance = phaserEngine;
    }

    public static get instance(): Phaser.Game {
        return Engine._instance;
    }
}

export let DEBUG = false;

export class Assert {

    public static ok(condition: boolean, message: string) {
        if (DEBUG && !condition) {
            Assert.throwError(message);
        }
    }

    public static equals(value1: any, value2: any, message: string) {
        if (DEBUG && value1 !== value2) {
            Assert.throwError(message);
        }
    }

    private static throwError(message: string) {
        console.error(message);

        message = message || 'Assertion failed';
        if (typeof Error !== 'undefined') {
            throw new Error(message);
        }
        throw message;
    }
}

export class DOMHelper {

    public createFileInput(parentId: string, id: string): HTMLInputElement {

        let input = document.createElement('input');
        input.type = 'file';
        input.id = id;

        document.getElementById(parentId).appendChild(input);

        return input;
    }

    public deleteElement(parentId: string, elementId: string) {
        let parent: HTMLElement = document.getElementById(parentId);

        parent.removeChild(document.getElementById(elementId));
    }

    public showElement(id: string) {
        document.getElementById(id).style.visibility = 'visible';
    }

    public hideElement(id: string) {
        document.getElementById(id).style.visibility = 'hidden';
    }
}


export class Pool<T> {
    private _pool: T[];
    private _resetter: Resettable<T>;

    constructor(Func: Resettable<T>) {
        this._pool = [];
        this._resetter = Func;
    }

    get(): T {
        if (this._pool.length) {
            return this._pool.splice(0, 1)[0];
        }
        return new this._resetter();
    }

    release(obj: T): void {
        if (this._resetter.reset) {
            this._resetter.reset(obj);
        }
        this._pool.push(obj);
    }
}
export interface Resettable<T extends Object> {
    // constructor
    new(): T;

    // static
    reset?(obj: T): void;
}

