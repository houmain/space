import { Planet, Squadron } from '../data/galaxyModels';
import { ClientMessageSender } from '../communication/communicationHandler';
import { Player } from '../data/gameData';

class SelectionArrow {

    private _planet: Planet;
    private _shaft: Phaser.GameObjects.Quad;

    public create(scene: Phaser.Scene, planet: Planet) {
        this._planet = planet;

        this._shaft = scene.add.quad(planet.x, planet.y, 'pixel');
    }

    public update(x: number, y: number) {

        let lineStrength = 10;

        let start: Phaser.Math.Vector2 = new Phaser.Math.Vector2(this._planet.x, this._planet.y);
        let end: Phaser.Math.Vector2 = new Phaser.Math.Vector2(x, y);
        let normal = end.clone().subtract(start).normalize().normalizeRightHand().scale(lineStrength);
        this._shaft.setTopLeft(start.x - normal.x, start.y - normal.y);
        this._shaft.setTopRight(start.x + normal.x, start.y + normal.y);
        this._shaft.setBottomLeft(end.x - normal.x, end.y - normal.y);
        this._shaft.setBottomRight(end.x + normal.x, end.y + normal.y);
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

export class InputHandler {

    private DOUBLE_CLICK_TIME = 400;
    private _lastDownTime: number = 0;

    private _movingCamera: boolean = false;
    private _draggingSelectionRect: boolean = false;
    private _showingSelectionArrows: boolean = false;

    private _scene: Phaser.Scene;
    private _camera: Phaser.Cameras.Scene2D.Camera;
    private _allPlanets: Planet[];
    private _player: Player;
    private _clientMessageSender: ClientMessageSender;

    private _selectionArrows: SelectionArrow[] = [];

    private _graphics;

    private _currentMouseX: number;
    private _currentMouseY: number;

    private _downScrollX: number;
    private _downScrollY: number;

    public constructor(scene: Phaser.Scene, player: Player, planets: Planet[], clientMessageSender: ClientMessageSender) {
        this._scene = scene;
        this._camera = scene.cameras.main;
        this._player = player;
        this._allPlanets = planets;
        this._clientMessageSender = clientMessageSender;

        this._rect = new Phaser.Geom.Rectangle(350, 250, 100, 100);
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

        if (pointer.downTime - this._lastDownTime < this.DOUBLE_CLICK_TIME) {
            this.startSelectionRect(pointer.x, pointer.y);
        }
        else {
            this._lastDownTime = pointer.downTime;
            let planet = this.planetUnderCursor(pointer.x, pointer.y);
            if (planet) {
                if (this.isOwnPlanet(planet)) {
                    this.selectPlanet(planet);
                    this.startSelectionArrows();
                }
                else {
                    this.selectPlanet(planet);
                }
            } else {
                this._movingCamera = true;
            }
        }
    }

    private onMouseMove(pointer: Phaser.Input.Pointer) {
        this._currentMouseX = pointer.x;
        this._currentMouseY = pointer.y;

        if (this._movingCamera) {
            this.moveCamera(pointer.x - pointer.downX, pointer.y - pointer.downY);
        } else if (this._showingSelectionArrows) {
            this.createSelectionArrows();
        } else if (this._draggingSelectionRect) {
            this.updateSelectionRect(pointer.x, pointer.y);
        }
    }

    private onMouseUp(pointer: Phaser.Input.Pointer) {
        if (this._draggingSelectionRect) {
            this.endSelectionRect();
        } else if (this._showingSelectionArrows) {
            this.endSelectionArrows(pointer.x, pointer.y);
        }

        this._movingCamera = false;
    }

    private _rect: Phaser.Geom.Rectangle;
    private _selectedPlanets: Planet[] = [];

    private isOwnPlanet(planet) {
        return (planet.faction && planet.faction.id === this._player.factionId);
    }

    private isPlanetSelected(planet) {
        return (this._selectedPlanets.indexOf(planet) >= 0);
    }

    private clearSelection() {
        this._selectedPlanets.splice(0);
        this._graphics.clear();
    }

    private selectPlanet(planet, clearSelection: boolean = true) {
        if (this.isPlanetSelected(planet))
            return;
        if (clearSelection)
            this.clearSelection();
        this._selectedPlanets.push(planet);
    }

    private startSelectionRect(x: number, y: number) {
        this._draggingSelectionRect = true;
        this.clearSelection();

        let worldPos = this.getWorldPosition(x, y);
        this._rect.x = worldPos.x;
        this._rect.y = worldPos.y;
        this._rect.width = 0;
        this._rect.height = 0;
    }

    private getWorldPosition(x: number, y: number): Vector2Like {
        let worldPos: Vector2Like = this._camera.getWorldPoint(x, y);
        return worldPos;
    }

    private planetUnderCursor(x: number, y: number): Planet {
        let size = 50;
        let worldPos = this.getWorldPosition(x, y);
        let pickRect = new Phaser.Geom.Rectangle(worldPos.x - size / 2, worldPos.y - size / 2, size, size);

        let numPlanets = this._allPlanets.length;
        let planet: Planet;
        for (let p = 0; p < numPlanets; p++) {
            planet = this._allPlanets[p];
            if (pickRect.contains(planet.x, planet.y)) {
                return planet;
            }
        }
        return null;
    }

    private startSelectionArrows() {
        this._showingSelectionArrows = true;
    }

    private createSelectionArrows() {
        if (this._selectionArrows.length == 0) {
            this._selectedPlanets.forEach(planet => {
                let arrow = new SelectionArrow();
                arrow.create(this._scene, planet);
                this._selectionArrows.push(arrow);
            });
        }
    }

    private moveCamera(dx: number, dy: number) {
        this._camera.setScroll(
            this._downScrollX - dx / this._camera.zoom,
            this._downScrollY - dy / this._camera.zoom);
    }

    private updateSelectionRect(x: number, y: number) {

        let worldPos = this.getWorldPosition(x, y);

        this._rect.width = worldPos.x - this._rect.x;
        this._rect.height = worldPos.y - this._rect.y;

        this._graphics.clear();
        this._graphics.strokeRectShape(this._rect);
    }

    private endSelectionArrows(x: number, y: number) {

        let targetPlanet = this.planetUnderCursor(x, y);
        if (targetPlanet !== null) {
            if (this.isPlanetSelected(targetPlanet)) {
                this.clearSelection();
                this.selectPlanet(targetPlanet);
            }
            else {
                let sendRate = 0.5;
                this._selectedPlanets.forEach(planet => {
                    let squadron: Squadron = this.findSquadronByFactionId(planet, this._player.factionId);
                    if (squadron) {
                        let numFighters = Math.floor(squadron.fighters.length * sendRate);
                        if (numFighters > 0) {
                            this._clientMessageSender.sendSquadron(planet.id, targetPlanet.id, numFighters);
                        }
                    }
                });
            }
        }

        this._graphics.clear();
        this._selectionArrows.forEach(arrow => { arrow.destroy(); });
        this._selectionArrows = [];
        this._showingSelectionArrows = false;
    }

    private endSelectionRect() {
        if (this._rect.width < 0) {
            this._rect.width *= -1;
            this._rect.x -= this._rect.width;
        }

        if (this._rect.height < 0) {
            this._rect.height *= -1;
            this._rect.y -= this._rect.height;
        }

        this.clearSelection();
        this._allPlanets.forEach(planet => {
            if (this._rect.contains(planet.x, planet.y))
                if (this.isOwnPlanet(planet))
                    this.selectPlanet(planet, false);
        });

        this._graphics.clear();
        this._draggingSelectionRect = false;
    }

    private findSquadronByFactionId(planet: Planet, factionId: number): Squadron {
        let numSquadrons = planet.squadrons.length;

        for (let s = 0; s < numSquadrons; s++) {
            if (planet.squadrons[s].faction != null && planet.squadrons[s].faction.id === factionId) {
                return planet.squadrons[s];
            }
        }

        return null;
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

        if (this._selectionArrows.length > 0) {

            let worldPos = this.getWorldPosition(this._currentMouseX, this._currentMouseY);
            this._selectionArrows.forEach(arrow => {
                arrow.update(worldPos.x, worldPos.y);
            });
        }
    }
}