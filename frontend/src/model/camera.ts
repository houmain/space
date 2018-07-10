export class Camera {

    private _camera: Phaser.Cameras.Scene2D.Camera;

    private _targetPositionX: number = 0;
    private _targetPositionY: number = 0;

    public constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        this._camera = camera;
    }

    public setDeltaPosition(x: number, y: number) {
        this._targetPositionX += x;
        this._targetPositionY += y;
    }

    public update() {
        this._camera.scrollX = (this._targetPositionX - this._camera.scrollX) * 0.1;
        this._camera.scrollY = (this._targetPositionY - this._camera.scrollY) * 0.1;
    }
}