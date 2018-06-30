export class HudScene extends Phaser.Scene {

	public constructor() {
		super({ key: 'hud' });
	}

	public create() {
		let info = this.add.text(10, 10, 'SPACE', { font: '48px Arial', fill: '#ffffff' });
	}
}