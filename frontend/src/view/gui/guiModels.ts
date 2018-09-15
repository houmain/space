export class ImageButton extends Phaser.GameObjects.Container {
	public onClick: Function = null;

	public constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string) {
		super(scene, x, y);

		let button = scene.add.image(0, 0, texture, frame);

		let hitarea = new Phaser.Geom.Circle(50, 50, 20);
		button.setInteractive({
			hitArea: hitarea,
			//	hitAreaCallback: Phaser.Geom.Circle.Contains,
			cursor: 'pointer'
		});
		button.on('pointerover', () => {
			button.setTint(0x666666);
		});
		button.on('pointerout', () => {
			button.setTint(0xffffff);
			button.setScale(1);
		});
		button.on('pointerdown', () => {
			button.setTint(0x333333);
			button.setScale(0.9);
			if (this.onClick) {
				this.onClick();
			}
		});
		button.on('pointerup', () => {
			button.setTint(0xffffff);
			button.setScale(1);
		});

		this.add(button);
	}
}

/*import { Button, GuiConfig, ButtonStyleConfig } from './guiInterfaces';


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
}*/