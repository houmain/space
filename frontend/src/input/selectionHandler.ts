export class SelectionHandler { // InputHandler

    private _rect: Phaser.Geom.Rectangle;
    private _graphics: any;

    public constructor(scene: Phaser.Scene) {
        this._rect = new Phaser.Geom.Rectangle(350, 250, 100, 100);
        this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xaa0000 }, fillStyle: { color: 0x00aa00 } });
    }

    public update() {
        this._graphics.clear();
        this._graphics.strokeRectShape(this._rect);
    }

    public onStartSelect(x: number, y: number) {
        this._rect.x = x;
        this._rect.y = y;
    }

    public onEndSelect() {
        this._graphics.clear();
    }

    public onSelectPosChanged(x: number, y: number) {

        this._rect.width = x - this._rect.x;
        this._rect.height = y - this._rect.y;

        this._graphics.clear();
        this._graphics.strokeRectShape(this._rect);
    }
}