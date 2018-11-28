import { TextButtonConfig } from './button/textButton';
import { GuiBoxConfig } from './box/guibox';
import { BitmapTextConfig } from './text/bitmapText';


export class GuiConfig {

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