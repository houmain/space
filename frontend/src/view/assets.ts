class TextureAtlasList {
	public readonly PRELOADER: string = 'atlasPreloader';
	//public readonly MAIN_MENU: string = 'atlasMainMenu';
	public readonly MAIN_MENU2: string = 'atlasMainMenu2';
	public readonly HUD: string = 'atlasGameGui';
}

export class Assets {
	public static ATLAS: TextureAtlasList = new TextureAtlasList();
}