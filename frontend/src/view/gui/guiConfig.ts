import { GuiBoxConfig } from './box/guibox';
import { SliderConfig, BitmapTextConfig, IconButtonConfig, TextButtonConfig } from './guiConfigInterfaces';

class Buttons {

	public readonly MAIN_MENU: IconButtonConfig = {
		texture: 'menuIcon'
	};

	public readonly NAVIGATION_LEFT: TextButtonConfig = {
		width: 240,
		height: 135,
		fontName: 'font_8',
		fontSize: 40,
		texture: 'leftNavigation',
		textOffset: {
			top: 50,
			left: 0
		}
	};
}

export class Labels {
	public HEADER_1: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 140,
	};

	public HEADER_2: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 70,
	};

	public HEADER_3: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 50,
	};

	public SLIDER_VALUE: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 50,
	};

	public SLIDER_MINMAX_VALUE: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 50,
	};

	public SLIDER_LABEL: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 40,
	};
}

class Sliders {
	/*
		public SETTINGS: SliderConfig = {
			label: Labels.HEADER_1,
			value: Labels.HEADER_1
		};*/
}

export class GuiConfig {

	public static readonly BUTTONS: Buttons = new Buttons();
	public static readonly LABELS: Labels = new Labels();

	public static readonly TEXT_BUTTON: TextButtonConfig = {
		width: 240,
		height: 135,
		fontName: 'font_8',
		fontSize: 40,
		texture: 'button',
		ninePatch: {
			top: 67,
			bottom: 67,
			left: 118,
			right: 118
		}
	};

	public static readonly SELECT_SESSION_BOX: GuiBoxConfig = {
		width: 1600,
		height: 500,
		texture: 'settingsBox',
		ninePatch: {
			top: 60,
			bottom: 30,
			left: 60,
			right: 124
		}
	};

	public static GUI_HEADER: BitmapTextConfig = {
		fontName: 'font_8',
		fontSize: 40,
	};
}