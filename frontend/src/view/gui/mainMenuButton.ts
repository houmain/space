import { Assets } from '../assets';

let ALPHA_ACTIVE = 1.0;
let ALPHA_MOUSE_OVER = 0.8;
let ALPHA_INACTIVE = 0.1;

export class MainMenuButton extends Phaser.GameObjects.Container {

	public onClick: Function = null;

	public constructor(scene: Phaser.Scene, label: string) {
		super(scene, 0, 0);

		let background = scene.add.image(0, 0, Assets.ATLAS.MAIN_MENU, 'button_large.png');
		this.add(background);
		this.add(scene.add.image(0, 0, Assets.ATLAS.MAIN_MENU, 'button_large_outer_wheel.png'));
		this.add(scene.add.image(0, -35, Assets.ATLAS.MAIN_MENU, 'button_large_inner_wheel_active.png'));

		let hook = scene.add.image(0, -170, Assets.ATLAS.MAIN_MENU, 'button_large_hook.png');
		hook.setScale(1, -1);
		this.add(hook);

		this.add(scene.add.image(0, 170, Assets.ATLAS.MAIN_MENU, 'button_large_hook.png'));

		let cornerTopLeft = scene.add.image(-130, -170, Assets.ATLAS.MAIN_MENU, 'button_large_corner_active.png');
		cornerTopLeft.setScale(1, -1);
		cornerTopLeft.alpha = ALPHA_INACTIVE;
		this.add(cornerTopLeft);

		let cornerTopRight = scene.add.image(130, -170, Assets.ATLAS.MAIN_MENU, 'button_large_corner_active.png');
		cornerTopRight.setScale(-1, -1);
		cornerTopRight.alpha = ALPHA_INACTIVE;
		this.add(cornerTopRight);

		let cornerBottomLeft = scene.add.image(-130, 170, Assets.ATLAS.MAIN_MENU, 'button_large_corner_active.png');
		cornerBottomLeft.alpha = ALPHA_INACTIVE;
		this.add(cornerBottomLeft);

		let cornerBottomRight = scene.add.image(130, 170, Assets.ATLAS.MAIN_MENU, 'button_large_corner_active.png');
		cornerBottomRight.setScale(-1, 1);
		cornerBottomRight.alpha = ALPHA_INACTIVE;
		this.add(cornerBottomRight);

		let buttonText = scene.add.bitmapText(0, 250, 'font_6', label);
		buttonText.setOrigin(0.5, 0.5);
		this.add(buttonText);

		background.setInteractive({
			cursor: 'pointer'
		});

		background.on('pointerover', () => {
			//		background.setTint(0x666666);
			cornerTopLeft.alpha = ALPHA_ACTIVE;
			cornerTopRight.alpha = ALPHA_ACTIVE;
			cornerBottomLeft.alpha = ALPHA_ACTIVE;
			cornerBottomRight.alpha = ALPHA_ACTIVE;
		});
		background.on('pointerout', () => {
			//	background.setTint(0xffffff);
			background.setScale(1);

			cornerTopLeft.alpha = ALPHA_INACTIVE;
			cornerTopRight.alpha = ALPHA_INACTIVE;
			cornerBottomLeft.alpha = ALPHA_INACTIVE;
			cornerBottomRight.alpha = ALPHA_INACTIVE;
		});

		background.on('pointerdown', () => {
			//	background.setTint(0x333333);
			background.setScale(0.9);
			if (this.onClick) {
				this.onClick();
			}
		});

		background.on('pointerup', () => {
			//	background.setTint(0xffffff);
			background.setScale(1);
		});
	}
}
