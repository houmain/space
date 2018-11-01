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