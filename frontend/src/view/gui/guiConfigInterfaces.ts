
export interface BitmapTextConfig {
	fontName: string;
	fontSize: number;
	width?: number;
	height?: number;
}

export interface SliderConfig {
	value: BitmapTextConfig;
	label: BitmapTextConfig;
	labelOffset?: {
		left: number;
		top: number;
	};
	valueOffset?: {
		left: number;
		top: number;
	};
}

export interface IconButtonConfig {
	width?: number;
	height?: number;
	texture: string;
	frame?: string;
	icon?: {
		texture: string;
		frame?: string
	};
}

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