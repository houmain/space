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