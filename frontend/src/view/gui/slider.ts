import { GuiFactory } from './guiFactory';
import { GuiConfig } from './guiConfig';
import { BitmapText } from './text/bitmapText';
import { BitmapTextConfig } from './guiConfigInterfaces';

//http://www.html5gamedevs.com/topic/37975-how-do-i-can-create-inputfield-in-phaser-3/

export interface SliderConfig {
	minValue: number;
	maxValue: number;
}

export class Slider extends Phaser.GameObjects.Container {

	private _knob: Phaser.GameObjects.Sprite;

	private _value: BitmapText;
	private _sliderConfig: SliderConfig;

	private _stepSize: number;
	private _numSteps: number;
	private _minKnobX = 0;
	private _maxKnobX = 0;
	private _knobMargin = 10;

	public constructor(scene: Phaser.Scene, x: number, y: number, label: string, sliderConfig: SliderConfig) {
		super(scene, x, y);

		this._sliderConfig = sliderConfig;

		let box = scene.add.sprite(0, 0, 'sliderBox');
		box.setOrigin(0, 0);
		this.add(box);

		let bar = scene.add.sprite(0, 40, 'sliderBarEmpty');
		bar.setOrigin(0, 0);

		this._minKnobX = this._knobMargin;
		this._maxKnobX = bar.width - this._knobMargin;
		this._numSteps = sliderConfig.maxValue - sliderConfig.minValue;
		this._stepSize = bar.width / this._numSteps;

		box.setInteractive();
		box.on('pointerup', (pointer: Phaser.Input.Pointer) => {

			let step = this.getKnobStep(this.getKnobXPosition(pointer));
			this.positionKnob(step);

			this._value.setText(step + '');
		});

		box.on('pointermove', (pointer: Phaser.Input.Pointer) => {
			if (pointer.isDown) {
				let x = this.getKnobXPosition(pointer);
				this._knob.setPosition(x, 20);

				let step = this.getKnobStep(x);
				this._value.setText(this._sliderConfig.minValue + step + '');
			}
		});
		this.add(bar);

		this._knob = scene.add.sprite(0, 20, 'sliderKnob');
		this.add(this._knob);

		this.addText(scene, 25, 20, label, GuiConfig.LABELS.SLIDER_LABEL);

		let defaultValue = sliderConfig.minValue;
		this._value = this.addText(scene, 325, 20, defaultValue.toString(), GuiConfig.LABELS.SLIDER_VALUE);
		this.positionKnob(defaultValue);
	}

	public get value(): number {
		return Number(this._value.text);
	}

	private addText(scene: Phaser.Scene, x: number, y: number, label: string, config: BitmapTextConfig): BitmapText {
		let text = GuiFactory.buildBitmapText(scene, x, y, label, config);
		text.setOrigin(0, 0);
		this.add(text);
		return text;
	}

	private getKnobXPosition(pointer: Phaser.Input.Pointer): number {
		let x = pointer.x - this.parentContainer.x;

		if (x < this._minKnobX) {
			x = this._minKnobX;
		}

		if (x > this._maxKnobX) {
			x = this._maxKnobX;
		}

		return x;
	}

	private positionKnob(step: number) {
		this._knob.setPosition(this._knobMargin + (step - this._sliderConfig.minValue) * this._stepSize, 20);
	}

	private getKnobStep(knobPositionX: number): number {
		let step = this._sliderConfig.minValue + knobPositionX / this._stepSize;
		return Math.round(step);
	}
}