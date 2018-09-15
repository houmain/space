export enum Texts {
	MAINMENU_TITLE = 'mainMenu.title',
	MAINMENU_PLAY = 'mainMenu.play',
	MAINMENU_OPTIONS = 'mainMenu.options',
	MAINMENU_QUIT = 'mainMenu.quit',

	INITGAME_TITLE = 'initGame.title',
	INITGAME_JOINING_GAME = 'initGame.joiningGame',

	ERROR_CONNECTION_FAILED = 'error.connectionfailed'
}

export class TextResources {
	private static _resources: { [key: string]: string; } = {};

	public static initialize() {
		TextResources._resources[Texts.MAINMENU_TITLE] = 'main menu';
		TextResources._resources[Texts.MAINMENU_PLAY] = 'play';
		TextResources._resources[Texts.MAINMENU_OPTIONS] = 'options';
		TextResources._resources[Texts.MAINMENU_QUIT] = 'quit';

		TextResources._resources[Texts.INITGAME_TITLE] = 'loading game';
		TextResources._resources[Texts.INITGAME_JOINING_GAME] = 'joining game';

		TextResources._resources[Texts.ERROR_CONNECTION_FAILED] = 'connection failed';
	}

	public static getText(key: string): string {
		let text = TextResources._resources[key];
		if (text) {
			return text;
		}
		console.warn(`${key} not found!`);
		return key;
	}

}
TextResources.initialize();