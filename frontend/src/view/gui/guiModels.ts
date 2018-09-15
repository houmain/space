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