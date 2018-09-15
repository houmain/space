import { Planet, Squadron } from '../data/galaxyModels';
import { ClientMessageSender } from '../communication/communicationHandler';
import { Player } from '../data/gameData';
import { GameSceneEvents } from '../scenes/scenes';

class SendArrow {
    private _planet: Planet;
    private _shaft: Phaser.GameObjects.Quad;

    public create(scene: Phaser.Scene, planet: Planet) {
        this._planet = planet;
        this._shaft = scene.add.quad(planet.x, planet.y, 'pixel');
    }

    public update(x: number, y: number, snapped: boolean) {
        let lineStrength = (snapped ? 5 : 2);
        this._shaft.bottomLeftAlpha = this._shaft.bottomRightAlpha = 0.3;
        let start: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this._planet.x, this._planet.y);
        let end: Phaser.Math.Vector2 = new Phaser.Math.Vector2(x, y);
        let dir = end.clone().subtract(start).normalize();
        let normal = dir.clone().normalizeRightHand();
        this._shaft.setBottomLeft(end.x - normal.x, end.y - normal.y);
        this._shaft.setBottomRight(end.x + normal.x, end.y + normal.y);
        start.add(dir.scale(15));
        normal.scale(lineStrength);
        this._shaft.setTopLeft(start.x - normal.x, start.y - normal.y);
        this._shaft.setTopRight(start.x + normal.x, start.y + normal.y);
    }

    public destroy() {
        this._shaft.destroy();
    }
}
/**
 *
 * TODO: separate rendering and logic into separate classes
 *
 */

const DOUBLE_CLICK_TIME = 400;

enum InputState {
    Idle,
    DraggingCamera,
    DraggingSelectionRect,
    DraggingSendArrow,
}

export class InputHandler {
    private _scene: Phaser.Scene;
    private _camera: Phaser.Cameras.Scene2D.Camera;
    private _allPlanets: Planet[];
    private _player: Player;
    private _clientMessageSender: ClientMessageSender;

    private _lastDownTime: number;
    private _currentMouseX: number;
    private _currentMouseY: number;
    private _downScrollX: number;
    private _downScrollY: number;
    private _state: InputState;
    private _sendArrows: SendArrow[] = [];
    private _selectionRect: Phaser.Geom.Rectangle;
    private _selectedPlanets: Planet[] = [];
    private _targetPlanet: Planet;
    private _graphics; //: Phaser.GameObjects.Graphics;

    public constructor(scene: Phaser.Scene, player: Player, planets: Planet[], clientMessageSender: ClientMessageSender) {
        this._scene = scene;
        this._camera = scene.cameras.main;
        this._player = player;
        this._allPlanets = planets;
        this._clientMessageSender = clientMessageSender;

        this._selectionRect = new Phaser.Geom.Rectangle(350, 250, 100, 100);
        this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0x00aa00 } });

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
        this._downScrollX = this._camera.scrollX;
        this._downScrollY = this._camera.scrollY;

        if (pointer.downTime - this._lastDownTime < DOUBLE_CLICK_TIME) {
            this._state = InputState.DraggingSelectionRect;
            this.startSelectionRect(pointer.x, pointer.y);
        }
        else {
            this._lastDownTime = pointer.downTime;
            let planet = this.planetUnderCursor(pointer.x, pointer.y);
            if (planet) {
                if (this.isOwnPlanet(planet)) {
                    this.selectPlanet(planet);
                    this._state = InputState.DraggingSendArrow;
                }
                else {
                    this.selectPlanet(planet);
                }
            } else {
                this._state = InputState.DraggingCamera;
            }
        }
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        this._currentMouseX = pointer.x;
        this._currentMouseY = pointer.y;

        switch (this._state) {
            case InputState.DraggingCamera:
                this.moveCamera(pointer.x - pointer.downX, pointer.y - pointer.downY);
                break;
            case InputState.DraggingSendArrow:
                this.createSendArrows();
                break;
            case InputState.DraggingSelectionRect:
                this.updateSelectionRect(pointer.x, pointer.y);
                break;
        }
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        switch (this._state) {
            case InputState.DraggingSelectionRect:
                this.endSelectionRect();
                break;
            case InputState.DraggingSendArrow:
                this.endSendArrows(pointer.x, pointer.y);
                break;
        }

        this._scene.events.emit(GameSceneEvents.PLANET_SELECTION_CHANGED, this._selectedPlanets);

        this._state = InputState.Idle;
    }

    private getWorldPosition(x: number, y: number): Phaser.Math.Vector2 {
        return this._camera.getWorldPoint(x, y);
    }

    private planetUnderCursor(x: number, y: number): Planet {
        let size = 50;
        let worldPos = this.getWorldPosition(x, y);
        let pickRect = new Phaser.Geom.Rectangle(
            worldPos.x - size / 2, worldPos.y - size / 2, size, size);
        for (let planet of this._allPlanets)
            if (planet.parent && pickRect.contains(planet.x, planet.y))
                return planet;
        return null;
    }

    private isOwnPlanet(planet) {
        return (planet.faction && planet.faction.id === this._player.factionId);
    }

    private findOwnSquadron(planet: Planet): Squadron {
        for (let squadron of planet.squadrons) {
            if (squadron.faction && squadron.faction.id === this._player.factionId) {
                return squadron;
            }
        }

        return null;
    }

    private isPlanetSelected(planet) {
        return (this._selectedPlanets.indexOf(planet) >= 0);
    }

    private clearSelection() {
        this._selectedPlanets.splice(0);
        this._graphics.clear();

        // this._scene.events.emit(GameSceneEvents.PLANET_SELECTION_CHANGED, this._selectedPlanets);
    }

    private selectPlanet(planet, clearSelection: boolean = true) {
        if (this.isPlanetSelected(planet)) {
            return;
        }

        if (clearSelection) {
            this.clearSelection();
        }

        this._selectedPlanets.push(planet);

        //this._scene.events.emit(GameSceneEvents.PLANET_SELECTION_CHANGED, this._selectedPlanets);
    }

    private moveCamera(dx: number, dy: number) {
        this._camera.setScroll(
            this._downScrollX - dx / this._camera.zoom,
            this._downScrollY - dy / this._camera.zoom);
    }

    private startSelectionRect(x: number, y: number) {
        this.clearSelection();

        let worldPos = this.getWorldPosition(x, y);
        this._selectionRect.x = worldPos.x;
        this._selectionRect.y = worldPos.y;
        this._selectionRect.width = 0;
        this._selectionRect.height = 0;
    }

    private normalizedRect(rect: Phaser.Geom.Rectangle) {
        rect = Phaser.Geom.Rectangle.Clone(rect);
        if (rect.width < 0) {
            rect.width *= -1;
            rect.x -= rect.width;
        }

        if (rect.height < 0) {
            rect.height *= -1;
            rect.y -= rect.height;
        }
        return rect;
    }

    private updateSelectionRect(x: number, y: number) {
        let worldPos = this.getWorldPosition(x, y);
        this._selectionRect.width = worldPos.x - this._selectionRect.x;
        this._selectionRect.height = worldPos.y - this._selectionRect.y;

        this._graphics.clear();
        this._graphics.strokeRectShape(this.normalizedRect(this._selectionRect));
    }

    private endSelectionRect() {
        this.clearSelection();
        this._allPlanets.forEach(planet => {
            if (this.normalizedRect(this._selectionRect).contains(planet.x, planet.y)) {
                if (this.isOwnPlanet(planet)) {
                    this.selectPlanet(planet, false);
                }
            }
        });
        this._graphics.clear();
    }

    private createSendArrows() {
        if (this._sendArrows.length === 0) {
            this._selectedPlanets.forEach(planet => {
                let arrow = new SendArrow();
                arrow.create(this._scene, planet);
                this._sendArrows.push(arrow);
            });
        }
    }

    private destroySendArrows() {
        this._graphics.clear();
        this._sendArrows.forEach(arrow => { arrow.destroy(); });
        this._sendArrows = [];
    }

    private updateSendArrows() {
        let planet = this.planetUnderCursor(this._currentMouseX, this._currentMouseY);
        let worldPos = this.getWorldPosition(this._currentMouseX, this._currentMouseY);

        let snapped = false;
        this._targetPlanet = null;
        if (planet && !this.isPlanetSelected(planet)) {
            this._targetPlanet = planet;
            worldPos.set(planet.x, planet.y);
            snapped = true;
        }

        this._sendArrows.forEach(arrow => {
            arrow.update(worldPos.x, worldPos.y, snapped);
        });
    }

    private endSendArrows(x: number, y: number) {
        if (this._targetPlanet == null) {
            let planet = this.planetUnderCursor(this._currentMouseX, this._currentMouseY);
            if (planet) {
                this.clearSelection();
                this.selectPlanet(planet);
            }
        }
        else {
            let sendRate = 0.5;
            this._selectedPlanets.forEach(planet => {
                let squadron = this.findOwnSquadron(planet);
                if (squadron) {
                    let numFighters = Math.floor(squadron.fighters.length * sendRate);
                    if (numFighters > 0) {
                        this._clientMessageSender.sendSquadron(planet.id, this._targetPlanet.id, numFighters);
                    }
                }
            });
        }
        this.destroySendArrows();
    }

    public update() {
        if (this._selectedPlanets.length > 0) {
            this._graphics.clear();

            this._selectedPlanets.forEach(planet => {
                this._graphics.strokeRectShape({
                    x: planet.x - 25,
                    y: planet.y - 25,
                    width: 50,
                    height: 50
                });
            });
        }

        if (this._state === InputState.DraggingSendArrow) {
            this.updateSendArrows();
        }
    }
}
