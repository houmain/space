class TextureAtlasList {
	public readonly PRELOADER: string = 'atlasPreloader';
	public readonly MAIN_MENU: string = 'atlasMainMenu2';
	public readonly HUD: string = 'atlasGameGui';
	public readonly GAME: string = 'atlasGame';
}

export class Assets {
	public static ATLAS: TextureAtlasList = new TextureAtlasList();
}