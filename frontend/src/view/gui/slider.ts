import { GuiFactory } from './guiFactory';
import { GuiConfig } from './guiConfig';

export class Slider extends Phaser.GameObjects.Container {

	public constructor(scene: Phaser.Scene, x: number, y: number, label: string) {
		super(scene, x, y);

		let background = scene.add.sprite(0, 0, 'settingsentry');
		background.setOrigin(0, 0);
		this.add(background);

		let text = GuiFactory.buildBitmapText(scene, 25, 20, label, GuiConfig.LABELS.HEADER_3);
		text.setOrigin(0, 0);
		this.add(text);
	}
}