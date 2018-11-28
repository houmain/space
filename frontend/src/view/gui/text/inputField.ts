import { NinePatch } from '@koreez/phaser3-ninepatch';

export class Inputfield extends Phaser.GameObjects.Container {

	private _box: NinePatch;
	private _boxFocus: NinePatch;
	private _text: Phaser.GameObjects.BitmapText;

	public constructor(scene: Phaser.Scene, x: number, y: number, text: string) {
		super(scene, x, y);

		this._box = new NinePatch(scene, 0, 0, 600, 116, 'textfield', null, {
			top: 58,
			bottom: 58,
			left: 180,
			right: 180
		});
		this._box.setOrigin(0, 0);
		this._box.setInteractive();

		this._box.on('pointerdown', () => {
			this.focus();
		});
		this.add(this._box);

		this._boxFocus = new NinePatch(scene, 0, 0, 600, 116, 'textfieldFocus', null, {
			top: 58,
			bottom: 58,
			left: 180,
			right: 180
		});
		this._boxFocus.setOrigin(0, 0);
		this._boxFocus.visible = false;
		this.add(this._boxFocus);

		this._text = scene.add.bitmapText(40, 25, 'font_8', text, 40);
		this._text.setOrigin(0, 0);
		this.add(this._text);
	}

	public setTextField(text: Phaser.GameObjects.BitmapText) {
		this._text = text;
		this.add(this._text);
	}

	public get text(): string {
		return this._text.text;
	}

	public focus() {
		this._box.visible = false;
		this._box.disableInteractive();

		this._boxFocus.visible = true;
		this._boxFocus.setInteractive();
	}

	public blur() {
		this._box.visible = true;
		this._box.setInteractive();

		this._boxFocus.visible = false;
		this._boxFocus.disableInteractive();
	}
}