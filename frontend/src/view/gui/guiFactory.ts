import { TextButton } from './guiModels';
import { Button, ButtonStyleConfig, GuiConfig } from './guiInterfaces';

export class GuiFactory {

	private _scene: Phaser.Scene;

	public constructor(scene: Phaser.Scene) {
		this._scene = scene;
	}

	public buildTextButton(label: string, config: GuiConfig, styleConfig: ButtonStyleConfig): Button {

		let button = new TextButton(this._scene, label, config, styleConfig);

		return button;
	}
}