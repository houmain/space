export class GameInfo {
    text: Phaser.GameObjects.Text;
    age: number;
}

export class GameInfoHandler {

    private _scene: Phaser.Scene;
    private _infos: GameInfo[] = [];

    public constructor(scene: Phaser.Scene) {
        this._scene = scene;
    }

    public addInfoText(text: string) {

        let info = new GameInfo();
        info.text = this._scene.add.text(0, 0, text);
        info.text.setScrollFactor(0);
        info.age = 0;
    }

    public update(timeElapsed: number) {
        this._infos.forEach((info, index) => {

            info.age += timeElapsed;

            if (info.age > 5000) {
                this._infos.splice(index, 1);
            }
        });
    }

    private removeInfo(info: GameInfo) {
        info.text.destroy();
    }
}
