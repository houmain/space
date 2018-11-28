import { NinePatch } from '@koreez/phaser3-ninepatch';

export interface TextButtonConfig {
	width: number;
	height: number;
	fontName: string;
	fontSize: number;
	texture: string;
	frame?: string;
	ninePatch?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	}
}

export class TextButton extends Phaser.GameObjects.Container {

	public constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
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
