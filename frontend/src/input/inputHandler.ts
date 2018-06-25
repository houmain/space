export interface InputHandlerUpdate {
    (x: number, y: number): void;
}

export class InputHandler {

    private _dragging: boolean = false;

    public onDrag: InputHandlerUpdate;

    public onSelectStart: InputHandlerUpdate;
    public onSelectEnd: InputHandlerUpdate;
    public onSelectedMouseMove: InputHandlerUpdate;

    private _dragStartX: number;
    private _dragStartY: number;

    private _moveCameraKey = 'Shift';
    private _moveCameraKeyDown = false;

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

        scene.input.keyboard.on('keydown', (event: any) => {
            this.onKeyDown(event.key);
        });

        scene.input.keyboard.on('keyup', (event: any) => {
            this.onKeyUp(event.key);
        });
    }

    private onKeyDown(keyCode: string) {

        switch (keyCode) {
            case this._moveCameraKey:
                this._moveCameraKeyDown = true;
                break;
            default:
                console.log(`Unhandled key ${keyCode} down`);
        }
    }

    private onKeyUp(keyCode: string) {

        switch (keyCode) {
            case this._moveCameraKey:
                this._moveCameraKeyDown = false;
                break;
            default:
                console.log(`Unhandled key ${keyCode} up`);
        }
    }

    private _mouseDown: boolean = false;

    private onMouseDown(pointer: Phaser.Input.Pointer) {
        this._mouseDown = true;

        if (this._moveCameraKeyDown) {
            this._dragging = true;
        } else {
            if (this.onSelectStart) {
                this.onSelectStart(pointer.x, pointer.y);
            }
        }
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        this._mouseDown = false;

        this._dragging = false;

        if (this.onSelectStart) {
            this.onSelectEnd(pointer.x, pointer.y);
        }
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {

        if (this._mouseDown) {
            if (this._moveCameraKeyDown) {
                if (this.onDrag) {
                    this.onDrag(pointer.x - pointer.downX, pointer.y - pointer.downY);
                }
            } else {
                this.onSelectedMouseMove(pointer.x, pointer.y);
            }
        }
        /*
        if (this._moveCameraKeyDown) {
            if (this.onDrag) {
                this.onDrag(pointer.x - pointer.downX, pointer.y - pointer.downY);
            }

        } else {
            if (this.onSelectedMouseMove) {
                this.onSelectedMouseMove(pointer.x, pointer.y);
            }
        }*/
    }
}