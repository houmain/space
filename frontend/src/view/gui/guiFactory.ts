import { TextButton } from './button/textButton';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { BitmapText } from './text/bitmapText';
import { GuiBoxConfig, GuiBox } from './box/guibox';
import { IconButton } from './button/iconButton';
import { BitmapTextConfig, IconButtonConfig, TextButtonConfig } from './guiConfigInterfaces';

class ButtonFactory {
	public static buildTextButton(scene: Phaser.Scene, x: number, y: number, text: string, config: TextButtonConfig): TextButton {
		let textButton = new TextButton(scene, x, y);

		let box = null;
		if (config.ninePatch) {
			box = new NinePatch(scene, 0, 0, config.width, config.height, config.texture, config.frame, {
				top: config.ninePatch.top,
				bottom: config.ninePatch.bottom,
				left: config.ninePatch.left,
				right: config.ninePatch.right
			});
		} else {
			box = scene.add.sprite(0, 0, config.texture, config.frame);
		}
		scene.add.existing(box);
		box.setOrigin(0, 0);
		box.setInteractive();
		box.on('pointerover', function () {
			box.setTint(0xcccccc);
		});
		box.on('pointerout', function () {
			box.clearTint();
		});
		box.on('pointerdown', () => {
			textButton.onClick();
		});
		textButton.add(box);

		let label = scene.add.bitmapText(box.width / 2, box.height / 2, config.fontName, text, config.fontSize);
		label.setOrigin(0.5, 0.5);
		if (config.textOffset) {
			label.setPosition(label.x + config.textOffset.left, label.y + config.textOffset.top);
		}
		textButton.add(label);

		return textButton;
	}

	public static buildIconButton(scene: Phaser.Scene, x: number, y: number, config: IconButtonConfig): IconButton {
		let iconButton = new IconButton(scene, x, y);

		let box = scene.add.image(0, 0, config.texture, config.frame);
		box.setOrigin(0, 0);
		box.setInteractive();
		if (config.width) {
			box.displayWidth = config.width;
		}
		if (config.height) {
			box.displayHeight = config.height;
		}

		iconButton.add(box);

		if (config.icon) {
			let icon = scene.add.sprite(0, 0, config.icon.texture, config.icon.frame);
			icon.setOrigin(0, 0);
			iconButton.add(icon);
		}

		box.on('pointerover', function () {
			box.setTint(0xcccccc);
		});
		box.on('pointerout', function () {
			box.clearTint();
		});
		box.on('pointerdown', () => {
			iconButton.onClick();
		});

		return iconButton;
	}
}

export class GuiFactory {

	public static buildTextButton(scene: Phaser.Scene, x: number, y: number, text: string, config: TextButtonConfig): TextButton {
		return ButtonFactory.buildTextButton(scene, x, y, text, config);
	}

	public static buildIconButton(scene: Phaser.Scene, x: number, y: number, config: IconButtonConfig): IconButton {
		return ButtonFactory.buildIconButton(scene, x, y, config);
	}

	public static buildBitmapText(scene: Phaser.Scene, x: number, y: number, text: string, config?: BitmapTextConfig): BitmapText {

		let bitmapText = new BitmapText(scene, x, y, config.fontName, text, config.fontSize);
		bitmapText.setOrigin(0, 0);
		if (config) {
			bitmapText.setWordWrapWidth(config.width - config.width);
		}
		scene.add.existing(bitmapText);
		return bitmapText;
	}

	public static buildBox(scene: Phaser.Scene, x: number, y: number, config?: GuiBoxConfig): GuiBox {
		let box = null;
		if (config.ninePatch) {
			box = new NinePatch(scene, 0, 0, config.width, config.height, config.texture, config.frame, {
				top: config.ninePatch.top,
				bottom: config.ninePatch.bottom,
				left: config.ninePatch.left,
				right: config.ninePatch.right
			});
		} else {
			scene.add.sprite(0, 0, config.texture, config.frame);
		}
		box.setOrigin(0, 0);
		box.setAlpha(0.5);

		let guiBox = new GuiBox(scene, 0, 0);
		guiBox.setBackground(box);
		scene.add.existing(guiBox);
		return guiBox;
	}
}