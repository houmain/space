import { States } from './states';
import { ClientError } from '../common/error';
import { Engine } from '../common/utils';

export class ErrorScene extends Phaser.Scene {

	private _errorCode: ClientError;

	public constructor() {
		super(States.ERROR);
	}

	public init(data: any) {
		this._errorCode = data.errorCode;
	}

	public create() {

		let errorText = '';
		switch (this._errorCode) {
			case ClientError.CONNECTION_FAILED:
				errorText = 'Connection failed';
				break;
			default:
				errorText = 'Error occured';
		}

		let x = Engine.instance.config.width as number / 2;
		let y = Engine.instance.config.height as number / 2;
		let container = this.add.container(x, y);

		let width = 700;
		let height = 60;

		let graphics = this.add.graphics();
		graphics.fillStyle(0x000000, 0.25);
		graphics.fillRect(-width / 2, -height / 2, width, height);

		let thickness = 8;
		let alpha = 0.8;
		graphics.lineStyle(thickness, 0xff0000, alpha);
		graphics.strokeRect(-width / 2, -height / 2, width, height);
		container.add(graphics);

		let text = this.add.text(0, 0, errorText, { font: '24px Arial', fill: '#ff0000', align: 'center' });
		text.setOrigin(0.5, 0.5);
		container.add(text);
	}
}