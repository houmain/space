export abstract class GuiButton extends Phaser.GameObjects.Container {
	public constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);
	}

	private _onClick: Function;

	public set onClickListener(func: Function) {
		this._onClick = func;
	}

	public onClick() {
		if (this._onClick) {
			this._onClick();
		}
	}
}

export class IconButton extends GuiButton {


}
