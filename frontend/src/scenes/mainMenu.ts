import { Scenes } from './scenes';
import { GuiScene } from './guiScene';
import { Texts, TextResources } from '../localization/textResources';
import { MainMenuButton } from '../view/gui/mainMenuButton';
import { NinePatch } from '@koreez/phaser3-ninepatch';
import { BitmapText } from '../view/gui/text/bitmapText';
import { SceneEvents } from '../logic/event/eventInterfaces';

export class InfoBoxNew {

	private _container: Phaser.GameObjects.Container;
	private _scene: Phaser.Scene;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public create() {
		this._container = this._scene.add.container(450, 100);

		let ninePatch = new NinePatch(this._scene, 0, 0, 300, 100, 'infoBox', null, {
			top: 16, // Amount of pixels for top
			bottom: 16, // Amount of pixels for bottom
			left: 16, // Amount of pixels for left
			right: 16 // Amount of pixels for right
		});
		ninePatch.setOrigin(0, 0);
		ninePatch.setAlpha(0.5);
		this._scene.add.existing(ninePatch);

		let text = new BitmapText(this._scene, 20, 20, 'infoText', 'Welcome to Bug?Galore? Space Odyssey'); //  this._scene.add.bitmapText(20, 20, 'infoText', 'Welcome to \nBug?Galore? \nSpace Odyssey');
		text.setWordWrapWidth(300);
		this._scene.add.existing(text);

		this._container.add(ninePatch);
		this._container.add(text);

		this._scene.tweens.add({
			targets: this._container,
			alpha: 0,
			duration: 3000,
			ease: 'Power2',
			completeDelay: 3000
		});
	}
}

export class MainMenuScene extends GuiScene {

	public constructor() {
		super(Scenes.MAIN_MENU);
	}

	public create() {
		super.create();

		// TODO: remove
		//this.startGame();
		//return;

		let gameButton = new MainMenuButton(this, TextResources.getText(Texts.MAIN_MENU.PLAY).toUpperCase());
		gameButton.setPosition(this.sys.canvas.width / 2, this.sys.canvas.height / 2);
		gameButton.onClick = () => {
			this.chooseGameType();
		};
		this.add.existing(gameButton);

		let quitButton = new MainMenuButton(this, TextResources.getText(Texts.MAIN_MENU.QUIT).toUpperCase());
		quitButton.setPosition(this.sys.canvas.width / 2 + 350, this.sys.canvas.height / 2);
		quitButton.setScale(0.9);
		quitButton.setAlpha(0.9);
		quitButton.onClick = () => {
			this.quitGame();
		};
		this.add.existing(quitButton);

		this.sys.game.events.on(SceneEvents.RESIZE, this.resize, this);
		this.resize();

		let i = new InfoBoxNew(this);
		i.create();
	}

	private chooseGameType() {
		this.scene.start(Scenes.CHOOSE_GAME_TYPE);
	}

	private startAiMenu() {
		this.scene.start(Scenes.BOT_MENU);
	}

	private quitGame() {
		this.openDialog();
		/*
		var inputField = document.createElement("input");
		inputField.setAttribute('type', 'text');
		inputField.setAttribute('name', "username");
		inputField.setAttribute('value', 'default');

		var button = document.createElement("input");
		button.type = "button";
		button.value = "im a button";
		button.className = 'test';
		button.onclick = () => {
			console.log(inputField.value);
			inputField.parentNode.removeChild(inputField);
			button.parentNode.removeChild(button);

			el.style.visibility = 'hidden';
		};

		let el = document.getElementById('overlay');
		el.style.visibility = (el.style.visibility == 'visible') ? 'hidden' : 'visible';
		window.scrollTo(0, 0);

		el.appendChild(inputField);
		el.appendChild(button);
*/
		//self.close();
	}

	private openDialog() {

		let overlay = document.getElementById('overlay');

		let messageBox = document.createElement('div');
		messageBox.className = 'messageBox';

		let messageBoxTitle = document.createElement('div');
		messageBoxTitle.className = 'messageBoxTitle';
		messageBoxTitle.innerHTML = 'Test';

		let inputField = document.createElement('input');
		inputField.className = 'messageBoxInput';
		inputField.setAttribute('type', 'text');
		inputField.type = 'text';
		inputField.value = 'My session';

		let okButton = document.createElement('input');
		okButton.type = 'button';
		okButton.value = 'OK';
		okButton.className = 'messageBoxButton';
		okButton.onclick = () => {
			console.log(inputField.value);
			messageBoxTitle.parentNode.removeChild(messageBoxTitle);
			inputField.parentNode.removeChild(inputField);
			okButton.parentNode.removeChild(okButton);

			messageBox.parentNode.removeChild(messageBox);

			overlay.style.visibility = 'hidden';
		};

		messageBox.appendChild(messageBoxTitle);
		messageBox.appendChild(inputField);
		messageBox.appendChild(okButton);

		overlay.appendChild(messageBox);

		overlay.style.visibility = 'visible';
		window.scrollTo(0, 0);
	}


}