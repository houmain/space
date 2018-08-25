import { Button, GuiConfig, ButtonStyleConfig } from './guiInterfaces';


export abstract class BaseButton implements Button {

	protected _container: Phaser.GameObjects.Container;

	public constructor(container: Phaser.GameObjects.Container) {
		this._container = container;
	}

	public onMouseDown(func: Function) {
		this._container.on('pointerdown', () => {
			func();
		});
	}
}

export class TextButton extends BaseButton {
	private _text: Phaser.GameObjects.Text;

	public constructor(container: Phaser.GameObjects.Container, text: Phaser.GameObjects.Text) {
		super(container);
		this._text = text;
	}

	public set label(label: string) {
		this._text.setText(label);
	}
}

export class ImageButton extends BaseButton {

	public constructor(container: Phaser.GameObjects.Container) {
		super(container);
	}
}