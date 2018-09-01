import { Scenes } from './scenes';
import { Assets } from '../view/assets';

export class BootScene extends Phaser.Scene {

	public constructor() {
		super(Scenes.BOOT);
	}

	public preload() {
		this.load.setPath('./assets/');
		this.load.atlas(Assets.ATLAS.PRELOADER, './spritesheets/preload.png', './spritesheets/preload.json');
		this.load.image('menuBackground', './images/menu_background.png');
		this.load.bitmapFont('progress_counter', './fonts/loading_counter-2x.png', './fonts/loading_counter-2x.xml');
		this.load.bitmapFont('font', './fonts/neuropol-export.png', './fonts/neuropol-export.xml');
	}

	public create() {
		this.scene.start(Scenes.PRELOADER);
	}
}