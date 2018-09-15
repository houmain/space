import { Assets } from '../assets';

let ALPHA_ACTIVE = 1.0;
let ALPHA_MOUSE_OVER = 0.8;
let ALPHA_INACTIVE = 0.1;

export class MainMenuButton extends Phaser.GameObjects.Container {

	public onClick: Function = null;

	public constructor(scene: Phaser.Scene, label: string) {
		super(scene, 0, 0);

		let background = scene.add.image(0, 0, Assets.ATLAS.MAIN_MENU2, 'button_large.png');
		this.add(background);
		this.add(scene.add.image(0, 0, Assets.ATLAS.MAIN_MENU2, 'button_large_outer_wheel.png'));
		this.add(scene.add.image(0, -35, Assets.ATLAS.MAIN_MENU2, 'button_large_inner_wheel_active.png'));

		let hook = scene.add.image(0, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_hook.png');
		hook.setScale(1, -1);
		this.add(hook);

		this.add(scene.add.image(0, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_hook.png'));

		let ca_top_left = scene.add.image(-130, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_top_left.setScale(1, -1);
		ca_top_left.alpha = ALPHA_INACTIVE;
		this.add(ca_top_left);

		let ca_top_right = scene.add.image(130, -170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_top_right.setScale(-1, -1);
		ca_top_right.alpha = ALPHA_INACTIVE;
		this.add(ca_top_right);

		let ca_bottom_left = scene.add.image(-130, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_bottom_left.alpha = ALPHA_INACTIVE;
		this.add(ca_bottom_left);

		let ca_bottom_right = scene.add.image(130, 170, Assets.ATLAS.MAIN_MENU2, 'button_large_corner_active.png');
		ca_bottom_right.setScale(-1, 1);
		ca_bottom_right.alpha = ALPHA_INACTIVE;
		this.add(ca_bottom_right);

		let buttonText = scene.add.bitmapText(0, 250, 'font_6', label);
		buttonText.setOrigin(0.5, 0.5);
		this.add(buttonText);

		background.setInteractive({
			cursor: 'pointer'
		});

		background.on('pointerover', () => {
			//		background.setTint(0x666666);
			ca_top_left.alpha = ALPHA_ACTIVE;
			ca_top_right.alpha = ALPHA_ACTIVE;
			ca_bottom_left.alpha = ALPHA_ACTIVE;
			ca_bottom_right.alpha = ALPHA_ACTIVE;
		});
		background.on('pointerout', () => {
			//	background.setTint(0xffffff);
			background.setScale(1);

			ca_top_left.alpha = ALPHA_INACTIVE;
			ca_top_right.alpha = ALPHA_INACTIVE;
			ca_bottom_left.alpha = ALPHA_INACTIVE;
			ca_bottom_right.alpha = ALPHA_INACTIVE;
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
