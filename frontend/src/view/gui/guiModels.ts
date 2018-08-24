import { Button, GuiConfig, ButtonStyleConfig } from './guiInterfaces';

export class TextButton implements Button {

	private _container: Phaser.GameObjects.Container;

	public constructor(scene: Phaser.Scene, text: string, config: GuiConfig, styleConfig: ButtonStyleConfig) {
		this._container = scene.add.container(config.x, config.y);

		let graphics = scene.add.graphics();
		graphics.fillStyle(styleConfig.color, styleConfig.alpha);
		graphics.fillRect(1, 1, config.width - 1, config.height - 1);

		graphics.lineStyle(styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha);
		graphics.strokeRect(0, 0, config.width, config.height);

		let label = scene.add.text(10, 10, text, {
			wordWrap: {
				width: config.width - 10
			}
		});

		this._container.add(graphics);
		this._container.add(label);
	}
}