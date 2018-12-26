import { parse, stringify } from 'flatted/esm';
import Prando from 'prando';

export class Engine {

    private static _instance: Phaser.Game;

    public static init(phaserEngine: Phaser.Game) {
        Engine._instance = phaserEngine;
    }

    public static get instance(): Phaser.Game {
        return Engine._instance;
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

export class StringUtils {

    public static fillText(text: string, ...args: any[]): string {
        let finalText = text;

        for (let a = 0; a < args.length; a++) {
            finalText = finalText.replace(`{${a}}`, args[a]);
        }

        return finalText;
    }
}

export class JSONDebugger {

    public static stringify(object: any): string {
        return stringify(object);
    }

    public static parse(jsonString: string): any {
        return parse(jsonString);
    }
}

export interface RandomNumberGenerator {
    random(): number;

    next(min: number, max: number): number;
}

export class ArrayUtils {

    public static shuffle<T>(array: T[], rng: RandomNumberGenerator): T[] {

        let counter = array.length;

        // While there are elements in the array
        while (counter > 0) {
            // Pick a random index
            let index = Math.floor(rng.random() * counter);

            // Decrease counter by 1
            counter--;

            // And swap the last element with it
            let temp = array[counter];
            array[counter] = array[index];
            array[index] = temp;
        }

        return array;
    }
}

export class SeedableRng implements RandomNumberGenerator {

    private _prando: Prando;

    public constructor(seed: string | number) {
        this._prando = new Prando(seed);
    }

    public random(): number {
        return this._prando.next();
    }

    public next(min: number, max: number): number {
        return this._prando.next(min, max);
    }
}

export class GuidHelper {
    public static newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

export class CookieHelper {

    public static setCookie(name, value, days) {
        let expires = '';
        if (days) {
            let date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    public static getCookie(name) {
        let nameEQ = name + '=';
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1, c.length);
            }
            if (c.indexOf(nameEQ) === 0) {
                return c.substring(nameEQ.length, c.length);
            }
        }
        return null;
    }

    public static eraseCookie(name) {
        document.cookie = name + '=; Max-Age=-99999999;';
    }
}