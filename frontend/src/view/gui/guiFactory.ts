import { TextButton, ImageButton } from './guiModels';
import { Button, ButtonStyleConfig, GuiConfig } from './guiInterfaces';


class GuiBuilder {
	private _scene: Phaser.Scene;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public buildTextButton(label: string, config: GuiConfig, styleConfig: ButtonStyleConfig): TextButton {

		let container = this.createContainer(config);
		let graphics = this.addGraphics(container);

		this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, styleConfig.color, styleConfig.alpha);
		this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)

		let text = this.addText(container, 10, 10, label, config.width - 10);

		this.setContainerInteractive(container, 0, 0, config.width, config.height);

		this.addEvent(container, 'pointerover', () => {
			this.clearGraphics(graphics);
			this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, 0xff0000, styleConfig.alpha);
			this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)
		});

		this.addEvent(container, 'pointerout', () => {
			this.clearGraphics(graphics);
			this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, styleConfig.color, styleConfig.alpha);
			this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)
		});

		return new TextButton(container, text);
	}

	public buildImageButton(texture: string, frame: string, config: GuiConfig, styleConfig: ButtonStyleConfig): ImageButton {
		let container = this.createContainer(config);
		let graphics = this.addGraphics(container);

		this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, styleConfig.color, styleConfig.alpha);
		this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)

		let image = this.addImage(container, 50, 50, texture, frame);
		image.setScale(0.5);
		this.setContainerInteractive(container, 0, 0, config.width, config.height);

		this.addEvent(container, 'pointerover', () => {
			this.clearGraphics(graphics);
			this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, 0xff00ff, styleConfig.alpha);
			this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)

			image.setTint(0x000000);
		});

		this.addEvent(container, 'pointerout', () => {
			this.clearGraphics(graphics);
			this.addFilledRectToGraphics(graphics, 1, 1, config.width - 1, config.height - 1, styleConfig.color, styleConfig.alpha);
			this.addStrokedRectToGraphics(graphics, 0, 0, config.width, config.height, styleConfig.borderThickness, styleConfig.borderColor, styleConfig.borderAlpha)

			image.setTint(0xffffff);
		});

		return new ImageButton(container);
	}

	private createContainer(config: GuiConfig) {
		return this._scene.add.container(config.x, config.y);
	}


	private clearGraphics(graphics: Phaser.GameObjects.Graphics) {
		graphics.clear();
	}

	private addGraphics(container: Phaser.GameObjects.Container) {
		let graphics = this._scene.add.graphics();
		container.add(graphics);
		return graphics;
	}

	private addFilledRectToGraphics(graphics: Phaser.GameObjects.Graphics, x, y, width, height, color, alpha) {
		graphics.fillStyle(color, alpha);
		graphics.fillRect(x, y, width, height);
	}

	private addStrokedRectToGraphics(graphics: Phaser.GameObjects.Graphics, x, y, width, height, borderThickness, borderColor, borderAlpha) {

		graphics.lineStyle(borderThickness, borderColor, borderAlpha);
		graphics.strokeRect(x, y, width, height);
	}

	private addText(container: Phaser.GameObjects.Container, x: number, y: number, text: string, width: number): Phaser.GameObjects.Text {
		let textField = this._scene.add.text(x, y, text, {
			fontFamily: 'Arial Black',
			fontSize: 28,
			wordWrap: {
				width: width - 10
			},
		});
		container.add(textField);

		return textField;
	}

	private addImage(container: Phaser.GameObjects.Container, x: number, y: number, texture: string, frame?: string): Phaser.GameObjects.Image {
		let image = this._scene.add.image(x, y, texture, frame);
		container.add(image);
		return image;
	}

	private setContainerInteractive(container: Phaser.GameObjects.Container, x: number, y: number, width: number, height: number) {
		container.setInteractive({
			hitArea: new Phaser.Geom.Rectangle(x, y, width, height),
			hitAreaCallback: Phaser.Geom.Rectangle.Contains,
			cursor: 'pointer'
		});
	}

	private addEvent(gameObject: Phaser.GameObjects.GameObject, event: string, func: Function) {
		gameObject.on(event, func);
	};
}

export class GuiFactory {

	private _scene: Phaser.Scene;
	private _guiBuilder: GuiBuilder;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
		this._guiBuilder = new GuiBuilder(scene);
	}

	public buildTextButton(label: string, config: GuiConfig, styleConfig: ButtonStyleConfig): TextButton {
		return this._guiBuilder.buildTextButton(label, config, styleConfig);
	}

	public buildImageButton(texture: string, frame: string, config: GuiConfig, styleConfig: ButtonStyleConfig) {
		return this._guiBuilder.buildImageButton(texture, frame, config, styleConfig);
	}
}
