import { Planet, Squadron } from '../data/galaxyModels';
import { ClientMessageSender } from '../communication/communicationHandler';
import { Player } from '../data/gameData';
import { Camera } from '../view/camera';

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
        let line = end.subtract(start).normalize();
        let normal1 = new Phaser.Math.Vector2(line.x * lineStrength, -line.y * lineStrength);
        let normal2 = new Phaser.Math.Vector2(-line.x * lineStrength, line.y * lineStrength);

        this._shaft.setTopLeft(this._planet.x + normal1.x, this._planet.y + normal1.y);
        this._shaft.setTopRight(this._planet.x + normal2.x, this._planet.y + normal2.y);

        this._shaft.setBottomLeft(x + normal1.x, y + normal1.y);
        this._shaft.setBottomRight(x + normal2.x, y + normal2.y);
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

export class InputHandler3 {

    private DOUBLE_CLICK_TIME = 1000;
    private _lastDownTime: number = 0;

    private _movingCamera: boolean = false;
    private _draggingSelectionRect: boolean = false;
    private _showingSelectionArrows: boolean = false;

    private _scene: Phaser.Scene;
    private _gameCamera: Camera;
    private _camera: Phaser.Cameras.Scene2D.Camera;
    private _allPlanets: Planet[];
    private _player: Player;
    private _clientMessageSender: ClientMessageSender;

    private _selectionArrows: SelectionArrow[] = [];

    private _graphics;

    private _currentMouseX: number;
    private _currentMouseY: number;

    public constructor(scene: Phaser.Scene, gameCamera: Camera, player: Player, planets: Planet[], clientMessageSender: ClientMessageSender) {
        this._scene = scene;
        this._gameCamera = gameCamera;
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
        let doubleClick = false;

        if (pointer.downTime - this._lastDownTime < this.DOUBLE_CLICK_TIME) {
            doubleClick = true;
        }

        this._lastDownTime = pointer.downTime;

        if (doubleClick) {
            this._draggingSelectionRect = true;
            this.startSelectionRect(pointer.x, pointer.y);
        } else {
            if (this.planetUnderCursor(pointer.x, pointer.y)) {
                this._showingSelectionArrows = true;
                this.createSelectionArrows();
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
        this._draggingSelectionRect = false;
        this._showingSelectionArrows = false;
    }

    private _rect: Phaser.Geom.Rectangle;
    private _selectedPlanets: Planet[] = [];

    private startSelectionRect(x: number, y: number) {
        this._selectedPlanets.splice(0);

        let worldPos = this.getWorldPosition(x, y);
        this._rect.x = worldPos.x;
        this._rect.y = worldPos.y;
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

    private createSelectionArrows() {
        this._selectionArrows = [];

        this._selectedPlanets.forEach(planet => {
            let arrow = new SelectionArrow();
            arrow.create(this._scene, planet);
            this._selectionArrows.push(arrow);

            console.log('pushed arrow');
        });
    }

    private destroySelectionArrows() {
        this._selectionArrows.forEach(arrow => {
            arrow.destroy();
        });

        this._selectionArrows = [];
    }

    private moveCamera(x: number, y: number) {
        this._gameCamera.setDeltaPosition(x, y);
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
            let sendRate = 0.5;

            this._selectedPlanets.forEach(planet => {
                let squadron: Squadron = this.findSquadronByFactionId(planet, this._player.factionId);

                let numFighters = Math.floor(squadron.fighters.length * sendRate);
                if (numFighters > 0) {
                    this._clientMessageSender.sendSquadron(planet.id, targetPlanet.id, numFighters);
                }
            });
        }

        this._selectedPlanets.splice(0);

        this._graphics.clear();
        this.destroySelectionArrows();
    }

    private endSelectionRect() {
        this._selectedPlanets.splice(0);

        if (this._rect.width < 0) {
            this._rect.width *= -1;
            this._rect.x -= this._rect.width;
        }

        if (this._rect.height < 0) {
            this._rect.height *= -1;
            this._rect.y -= this._rect.height;
        }

        this._allPlanets.forEach(planet => {
            if (this._rect.contains(planet.x, planet.y) && planet.faction && planet.faction.id === this._player.factionId) {
                this._selectedPlanets.push(planet);
            }
        });

        this._graphics.clear();
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
/*
export class SelectionHandler { // InputHandler

    private _scene: Phaser.Scene;
    private _camera: Phaser.Cameras.Scene2D.Camera;
    private _player: Player;
    private _clientMessageSender: ClientMessageSender;

    private _rect: Phaser.Geom.Rectangle;
    private _graphics: any;

    private _allPlanets: Planet[];
    private _selectedPlanets: Planet[] = [];

    private _selectionArrows: SelectionArrow[] = [];

    private _currentMouseX: number;
    private _currentMouseY: number;

    public constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, player: Player, planets: Planet[], clientMessageSender: ClientMessageSender) {
        this._scene = scene;
        this._camera = camera;
        this._player = player;
        this._allPlanets = planets;
        this._clientMessageSender = clientMessageSender;

        this._rect = new Phaser.Geom.Rectangle(350, 250, 100, 100);
        this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0x00aa00 } });
    }

    private getWorldPosition(x: number, y: number): Vector2Like {
        let worldPos: Vector2Like = this._camera.getWorldPoint(x, y);
        return worldPos;
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

    public selectPlanet(planet: Planet) {
        this._selectedPlanets.splice(0);
        this._selectedPlanets.push(planet);
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

    public onStartSelect(x: number, y: number) {

        // check if planet under cursor
        if (this.planetUnderCursor(x, y) !== null) {
            // else draw drag arrow
            this.createSelectionArrows();
        } else {
            this._selectedPlanets.splice(0);

            let worldPos = this.getWorldPosition(x, y);
            this._rect.x = worldPos.x;
            this._rect.y = worldPos.y;
        }
    }

    private createSelectionArrows() {
        this._selectionArrows = [];

        this._selectedPlanets.forEach(planet => {
            let arrow = new SelectionArrow();
            arrow.create(this._scene, planet);
            this._selectionArrows.push(arrow);

            console.log('pushed arrow');
        });
    }

    private destroySelectionArrows() {
        this._selectionArrows.forEach(arrow => {
            arrow.destroy();
        });

        this._selectionArrows = [];
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

    public onEndSelect(x: number, y: number) {

        if (this._selectionArrows.length > 0) {

            let targetPlanet = this.planetUnderCursor(x, y);
            if (targetPlanet !== null) {
                let sendRate = 0.5;

                this._selectedPlanets.forEach(planet => {
                    let squadron: Squadron = this.findSquadronByFactionId(planet, this._player.factionId);

                    let numFighters = Math.floor(squadron.fighters.length * sendRate);
                    if (numFighters > 0) {
                        this._clientMessageSender.sendSquadron(planet.id, targetPlanet.id, numFighters);
                    }
                });
            }

            this._selectedPlanets.splice(0);
        } else {
            this._selectedPlanets.splice(0);

            if (this._rect.width < 0) {
                this._rect.width *= -1;
                this._rect.x -= this._rect.width;
            }

            if (this._rect.height < 0) {
                this._rect.height *= -1;
                this._rect.y -= this._rect.height;
            }

            this._allPlanets.forEach(planet => {
                if (this._rect.contains(planet.x, planet.y) && planet.faction && planet.faction.id === this._player.factionId) {
                    this._selectedPlanets.push(planet);
                }
            });
        }

        this._graphics.clear();
        this.destroySelectionArrows();
    }

    public onSelectPosChanged(x: number, y: number) {
        this._currentMouseX = x;
        this._currentMouseY = y;

        let worldPos = this.getWorldPosition(x, y);

        if (this._selectionArrows.length === 0) {
            this._rect.width = worldPos.x - this._rect.x;
            this._rect.height = worldPos.y - this._rect.y;

            this._graphics.clear();
            this._graphics.strokeRectShape(this._rect);

        }
    }
}*/