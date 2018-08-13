/*export interface InputHandlerUpdate {
    (x: number, y: number): void;
}

export class InputHandler2 {

    private DOUBLE_CLICK_TIME = 1000;
    private _lastDownTime: number = 0;

    private _movingCamera: boolean = false;
    private _draggingSelectionRect: boolean = false;

    public onMovingCamera: InputHandlerUpdate;
    public onStartSelection: InputHandlerUpdate;
    public onDraggingSelectionRect: InputHandlerUpdate;
    public onEndSelection: InputHandlerUpdate;

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
        if (pointer.downTime - this._lastDownTime < this.DOUBLE_CLICK_TIME) {
            console.log('double click');
            this._draggingSelectionRect = true;
            this.onStartSelection(pointer.x, pointer.y);
        } else {
            console.log('nope');
            this._movingCamera = true;
        }
        this._lastDownTime = pointer.downTime;
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        if (this._movingCamera) {
            this.onMovingCamera(pointer.x - pointer.downX, pointer.y - pointer.downY);
        } else if (this._draggingSelectionRect) {
            this.onDraggingSelectionRect(pointer.x, pointer.y);
        }
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        if (this._draggingSelectionRect) {
            this.onEndSelection(pointer.x, pointer.y);
        }

        this._movingCamera = false;
        this._draggingSelectionRect = false;
    }
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

    private _mouseDown: boolean = false;

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
    }
}*/