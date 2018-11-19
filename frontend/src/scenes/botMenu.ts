import { Scenes } from './scenes';
import { BotLoader } from '../logic/bot/botLoader';
import { DOMHelper } from '../common/utils';
import { BotScriptLoader } from '../logic/bot/scriptLoader';
import { BotController } from '../logic/bot/botInterfaces';

export class BotMenuScene extends Phaser.Scene {
	public constructor() {
		super(Scenes.BOT_MENU);
	}

	public create() {
		let background = this.add.tileSprite(0, 0, 2048, 2048, 'mainMenu');
		background.setTint(0x555555);

		let scriptLoader = new BotScriptLoader();
		let botLoader = new BotLoader();
		botLoader.onLoaded = this.onLoadingComplete.bind(this);

		let domHelper = new DOMHelper();
		let divName = 'topDiv';
		domHelper.showElement(divName);
		let input = domHelper.createFileInput(divName, 'fileUpload');
		input.addEventListener('change',
			(evt) => {
				scriptLoader.loadScript(evt, botLoader.loadBot.bind(botLoader));
				input.value = null;
			}, false);

		/*	let textButton = new GuiFactory(this).buildTextButton('RELOAD',
				{
					x: 400,
					y: 500,
					width: 130,
					height: 50
				}, GuiConfig.textButton);
			textButton.onMouseDown(() => {
				//this.reloadScript();
			});

			let backButton = new GuiFactory(this).buildTextButton('BACK',
				{
					x: 200,
					y: 500,
					width: 130,
					height: 50
				}, GuiConfig.textButton);
			backButton.onMouseDown(() => {
				this.leaveScene();
				this.scene.start(Scenes.MAIN_MENU);
			});*/
	}

	private onLoadingComplete(bot: BotController) {

		//	this.add.sprite(100, 100, Assets.ATLAS.MAIN_MENU, 'ai.png');

		this.add.text(180, 50, `NAME: ${bot.info.name}`);
		this.add.text(180, 80, `AUTHOR: ${bot.info.author}`);
		this.add.text(180, 110, `VERSION: ${bot.info.version}`);

		console.log(bot.info.name + ' loaded');
	}


	private leaveScene() {
		let domHelper = new DOMHelper();
		domHelper.hideElement('topDiv');
		domHelper.deleteElement('topDiv', 'fileUpload');
	}
}