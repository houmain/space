class TextureAtlasList {
	public readonly PRELOADER: string = 'atlasPreloader';
	public readonly MAIN_MENU: string = 'atlasMainMenu2';
	public readonly HUD: string = 'atlasGameGui'; //TODO
	public readonly GAME: string = 'atlasGame';
	public readonly PLANETS: string = 'atlasPlanets';
	public readonly FACTIONS: string = 'atlasFactions';
}

export class Assets {
	public static ATLAS: TextureAtlasList = new TextureAtlasList();
}