import { Planet } from '../model/galaxyModels';
/**
 *
 * TODO: separate rendering and logic into separate classes
 *
 */
export class SelectionHandler { // InputHandler

    private _camera: Phaser.Cameras.Scene2D.Camera;
    private _rect: Phaser.Geom.Rectangle;
    private _graphics: any;

    private _allPlanets: Planet[];
    private _selectedPlanets: Planet[] = [];

    public constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, planets: Planet[]) {
        this._camera = camera;
        this._allPlanets = planets;

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
    }

    private planetUnderCursor(x: number, y: number) {
        let size = 50;
        let pickRect = new Phaser.Geom.Rectangle(x - size / 2, y - size / 2, size, size);

        let numPlanets = this._allPlanets.length;
        let planet: Planet;
        for (let p = 0; p < numPlanets; p++) {
            planet = this._allPlanets[p];
            if (pickRect.contains(planet.x, planet.y)) {
                return true;
            }
        }
        return false;
    }

    public onStartSelect(x: number, y: number) {

        // check if planet under cursor
        if (this.planetUnderCursor(x, y)) {
            // else draw drag arrow
        } else {
            this._selectedPlanets.splice(0); // if no splice seleced

            let worldPos = this.getWorldPosition(x, y);
            this._rect.x = worldPos.x;
            this._rect.y = worldPos.y;
        }
    }

    public onEndSelect() {

        this._selectedPlanets.splice(0);

        this._allPlanets.forEach(planet => {
            if (this._rect.contains(planet.x, planet.y)) {
                this._selectedPlanets.push(planet);
            }
        });

        this._graphics.clear();
    }

    public onSelectPosChanged(x: number, y: number) {
        let worldPos = this.getWorldPosition(x, y);

        this._rect.width = worldPos.x - this._rect.x;
        this._rect.height = worldPos.y - this._rect.y;

        this._graphics.clear();
        this._graphics.strokeRectShape(this._rect);
    }
}