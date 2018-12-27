export class RoundButton extends Phaser.GameObjects.Container {

	public onClick: Function = null;

	private _background: Phaser.GameObjects.Sprite;

	public constructor(scene: Phaser.Scene) {
		super(scene, 0, 0);

		this._background = scene.add.sprite(0, 0, 'roundButton');

		this.add(this._background);
		this.add(scene.add.sprite(0, 0, 'playIcon'));

		this._background.on('pointerover', () => {

		});
		this._background.on('pointerout', () => {
			this._background.setScale(1);
		});

		this._background.on('pointerdown', () => {
			this._background.setScale(0.9);
			if (this.onClick) {
				this.onClick();
			}
		});

		this._background.on('pointerup', () => {
			this._background.setScale(1);
		});

		this.enable();
	}

	public disable() {
		this._background.removeInteractive();
		this._background.setAlpha(0.6);
	}

	public enable() {
		this._background.setInteractive({
			cursor: 'pointer'
		});
		this._background.setAlpha(1);
	}
}