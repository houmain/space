export class RoundButton extends Phaser.GameObjects.Container {

	public onClick: Function = null;

	public constructor(scene: Phaser.Scene) {
		super(scene, 0, 0);

		let background = scene.add.sprite(0, 0, 'roundButton');
		background.setInteractive({
			cursor: 'pointer'
		});

		this.add(background);
		this.add(scene.add.sprite(0, 0, 'playIcon'));

		background.on('pointerover', () => {

		});
		background.on('pointerout', () => {
			background.setScale(1);
		});

		background.on('pointerdown', () => {
			background.setScale(0.9);
			if (this.onClick) {
				this.onClick();
			}
		});

		background.on('pointerup', () => {
			background.setScale(1);
		});
	}
}