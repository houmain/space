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

    private _selectKey = 'Shift';
    private _selectKeyDown = false;

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
            case this._selectKey:
                this._selectKeyDown = true;
                break;
            default:
                console.log(`Unhandled key ${keyCode} down`);
        }
    }

    private onKeyUp(keyCode: string) {

        switch (keyCode) {
            case this._selectKey:
                this._selectKeyDown = false;
                break;
            default:
                console.log(`Unhandled key ${keyCode} up`);
        }
    }

    private onMouseDown(pointer: Phaser.Input.Pointer) {
        if (this._selectKeyDown) {
            if (this.onSelectStart) {
                this.onSelectStart(pointer.x, pointer.y);
            }
        } else {
            this._dragging = true;
        }
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        this._dragging = false;

        if (this.onSelectStart) {
            this.onSelectEnd(pointer.x, pointer.y);
        }
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        if (this._dragging) {
            if (this.onDrag) {
                this.onDrag(pointer.x - pointer.downX, pointer.y - pointer.downY);
            }
        } else if (this._selectKeyDown) {
            if (this.onSelectedMouseMove) {
                this.onSelectedMouseMove(pointer.x, pointer.y);
            }
        }
    }
}