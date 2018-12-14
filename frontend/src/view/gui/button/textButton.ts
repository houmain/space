import { GuiButton } from './iconButton';

export interface TextButtonConfig {
	width: number;
	height: number;
	fontName: string;
	fontSize: number;
	texture: string;
	frame?: string;
	ninePatch?: {
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
	textOffset?: {
		left: number;
		top: number;
	};
}

export class TextButton extends GuiButton {

}