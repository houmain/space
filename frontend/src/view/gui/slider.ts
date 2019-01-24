import { GuiFactory } from './guiFactory';
import { GuiConfig } from './guiConfig';
import { BitmapText } from './text/bitmapText';
import { BitmapTextConfig } from './guiConfigInterfaces';

//http://www.html5gamedevs.com/topic/37975-how-do-i-can-create-inputfield-in-phaser-3/

export interface SliderConfig {
	minValue: number;
	maxValue: number;
	defaultValue: number;
}

export class Slider extends Phaser.GameObjects.Container {

	private _knob: Phaser.GameObjects.Sprite;

	private _value: BitmapText;
	private _sliderConfig: SliderConfig;

	private _stepSize: number;
	private _numSteps: number;

	private _barMarginLeft: number = 20;
	private _barMarginTop: number = 20;

	private _bar: Phaser.GameObjects.Sprite;
	private _barFull: Phaser.GameObjects.Sprite;
	private _box: Phaser.GameObjects.Sprite;

	public constructor(scene: Phaser.Scene, x: number, y: number, label: string, sliderConfig: SliderConfig) {
		super(scene, x, y);

		this._sliderConfig = sliderConfig;

		this._box = scene.add.sprite(0, 0, 'sliderBox');
		this._box.setOrigin(0, 0);
		this.add(this._box);

		this._bar = scene.add.sprite(this._barMarginLeft, this._barMarginTop, 'sliderBarEmpty');
		this._bar.setOrigin(0, 0.5);

		this._barFull = scene.add.sprite(this._barMarginLeft, this._barMarginTop, 'sliderBarFull');
		this._barFull.setOrigin(0, 0.5);

		this._numSteps = sliderConfig.maxValue - sliderConfig.minValue;
		this._stepSize = this._bar.width / this._numSteps;

		this.add(this._bar);
		this.add(this._barFull);

		this._knob = scene.add.sprite(0, 20, 'sliderKnob');
		this._knob.setOrigin(0, 0.5);
		this.add(this._knob);

		this.addText(scene, 25, 30, label, GuiConfig.LABELS.SLIDER_LABEL);

		let defaultValue = sliderConfig.minValue;

		this._value = this.addText(scene, 325, 20, defaultValue.toString(), GuiConfig.LABELS.SLIDER_VALUE);

		let defaultPercentage = sliderConfig.defaultValue === sliderConfig.minValue ? 0 : (sliderConfig.defaultValue - sliderConfig.minValue) / (sliderConfig.maxValue - sliderConfig.minValue);
		this.updateSlider(defaultPercentage);
	}

	public get box() {
		return this._box;
	}

	public get value(): number {
		return Number(this._value.text);
	}

	public onPointerMove(pointer: Phaser.Input.Pointer) {
		let percentage = this.getPercentage(pointer);

		this.updateSlider(percentage);
	}

	private getPercentage(pointer: Phaser.Input.Pointer) {
		let x = pointer.x - this.x - this.parentContainer.x - this._bar.x;

		if (x < 0) {
			x = 0;
		}

		if (x > this._bar.width) {
			x = this._bar.width;
		}

		let percentage = x / this._bar.width;
		return percentage;
	}

	private addText(scene: Phaser.Scene, x: number, y: number, label: string, config: BitmapTextConfig): BitmapText {
		let text = GuiFactory.buildBitmapText(scene, x, y, label, config);
		text.setOrigin(0, 0);
		this.add(text);
		return text;
	}

	private updateSlider(percentage: number) {
		this._knob.setPosition(this._barMarginLeft + percentage * this._bar.width, this._barMarginTop);

		let value = this._sliderConfig.minValue + Math.round(this._numSteps * percentage);
		this._value.setText(value.toString());

		this._barFull.setScale(percentage * this._bar.width, 1);
	}
}