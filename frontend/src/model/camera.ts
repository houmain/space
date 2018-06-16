import { Engine } from '../utils';

export class Camera {

    private _camera: Phaser.Cameras.Scene2D.Camera;

    public constructor(camera: Phaser.Cameras.Scene2D.Camera) {
        this._camera = camera;
    }

    public update(x: number, y: number) {
        this._camera.setPosition(x, y);
    }
}