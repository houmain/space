import { NinePatch } from '@koreez/phaser3-ninepatch';

export interface GuiBoxConfig {
	width: number;
	height: number;
	texture: string;
	frame?: string;
	ninePatch?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
}

export class GuiBox extends Phaser.GameObjects.Container {

	private _background: NinePatch;

	public constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);
	}

	public setBackground(background: NinePatch) {
		this._background = background;
		this.add(background);
	}

	public get width() {
		return this._background.width;
	}

	public get height() {
		return this._background.height;
	}
}

