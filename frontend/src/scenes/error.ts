import { Scenes } from './scenes';
import { ClientError } from '../common/error';
import { Engine } from '../common/utils';

export class ErrorScene extends Phaser.Scene {

	private _errorCode: ClientError;
	private _timedEvent: Phaser.Time.TimerEvent;

	private _retryText: Phaser.GameObjects.Text;
	private _retryInSeconds = 5;

	public constructor() {
		super(Scenes.ERROR);
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

		this._retryText = this.add.text(0, 100, '', { font: '24px Arial', fill: '#ff0000', align: 'center' });
		this._retryText.setOrigin(0.5, 0.5);
		container.add(this._retryText);

		this._timedEvent = this.time.delayedCall(this._retryInSeconds * 1000, this.onTimerEvent, [], this);
	}

	public update() {
		this._retryText.setText(`Retrying in ${this._retryInSeconds - Math.floor(this._timedEvent.getElapsedSeconds())} seconds ...`);
	}

	private onTimerEvent() {
		this.scene.start(Scenes.PRELOADER);
	}
}