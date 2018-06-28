import { Planet } from '../model/galaxyModels';
/**
 *
 * TODO: separate rendering and logic into separate classes
 *
 */
export class SelectionHandler { // InputHandler

    private _rect: Phaser.Geom.Rectangle;
    private _graphics: any;

    private _allPlanets: Planet[];
    private _selectedPlanets: Planet[] = [];

    public constructor(scene: Phaser.Scene, planets: Planet[]) {
        this._allPlanets = planets;

        this._rect = new Phaser.Geom.Rectangle(350, 250, 100, 100);
        this._graphics = scene.add.graphics({ lineStyle: { width: 2, color: 0xffffff }, fillStyle: { color: 0x00aa00 } });
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

    public onStartSelect(x: number, y: number) {
        this._rect.x = x;
        this._rect.y = y;
    }

    public onEndSelect() {

        this._selectedPlanets.splice(0);

        // console.log(`check x:${this._rect.x} y:${this._rect.x} width:${this._rect.width} x:${this._rect.height}`);

        this._allPlanets.forEach(planet => {

            //   console.log(`planet x:${planet.x} y:${planet.x}`);

            if (this._rect.contains(planet.x, planet.y)) {
                this._selectedPlanets.push(planet);

                //  console.log('found');
            }
        });

        this._graphics.clear();
    }

    public onSelectPosChanged(x: number, y: number) {

        this._rect.width = x - this._rect.x;
        this._rect.height = y - this._rect.y;

        this._graphics.clear();
        this._graphics.strokeRectShape(this._rect);
    }
}