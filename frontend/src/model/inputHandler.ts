export interface InputHandlerUpdate {
    (x: number, y: number): void;
}

export class InputHandler {

    private _dragging: boolean = false;

    public onDrag: InputHandlerUpdate;

    private _dragStartX: number;
    private _dragStartY: number;

    public constructor(scene: Phaser.Scene) {

        scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.onMouseDown(pointer);
        });

        scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            this.onMouseUp(pointer);
        });

        scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            this.onMouseMove(pointer);
        });
    }

    private onMouseDown(pointer: Phaser.Input.Pointer) {
        this._dragging = true;
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        this._dragging = false;
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        if (this._dragging) {
            if (this.onDrag) {
                this.onDrag(pointer.x - pointer.downX, pointer.y - pointer.downY);
            }
        }
    }
}