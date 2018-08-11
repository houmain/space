import { States } from './states';
import { ClientError } from '../common/error';

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

		this.add.text(300, 200, errorText, { font: '48px Arial', fill: '#ff0000', align: 'center' });
	}
}