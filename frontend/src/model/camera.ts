export class Camera {

    private _camera: Phaser.Cameras.Scene2D.Camera;

    private _x: number = 0;
    private _y: number = 0;

    public constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        this._camera = camera;
    }

    public setPosition(x: number, y: number) {
        this._x = x;
        this._y = y;
    }

    public update() {
        this._camera.setPosition(this._x, this._y);
    }
}