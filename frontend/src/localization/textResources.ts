import { DebugInfo } from '../common/debug';

class TextResourcesMainMenu {
	public readonly TITLE = 'mainMenu.title';
	public readonly PLAY = 'mainMenu.play';
	public readonly OPTIONS = 'mainMenu.options';
	public readonly QUIT = 'mainMenu.quit';
}

class TextResourcesInitGame {
	public readonly TITLE = 'initGame.title';
	public readonly JOINING_GAME = 'initGame.joiningGame';
}

class TextResourcesGame {
	//---- Planet info ---------------
	public readonly MAINTAINANCE = 'game.maintainance';
	public readonly PRODUCTIVITY = 'game.productivity';
	public readonly DEFENSE = 'game.defense';
	public readonly FIGHTERS = 'game.fighters';

	//---- Infobox --------------
	// player
	public readonly PLAYER_ATTACK_FAILED = 'game.playerAttackFailed';
	public readonly PLAYER_PLANET_UNDER_ATTACK = 'game.playerPlanetUnderAttack';
	public readonly PLAYER_REPELLED_ATTACK = 'game.playerRepelledAttack';
	public readonly PLAYER_CONQUERED_PLANET = 'game.playerConqueredPlanet';
	public readonly PLAYER_PLANET_LOST = 'game.planetLost';
	public readonly PLAYER_GAME_OVER = 'game.playerGameOver';


	// factions
	public readonly FACTION_CONQUERED_PLANET = 'game.factionConqueredPlanet';
	public readonly FACTION_JOINED = 'game.factionJoined';
	public readonly FACTION_DESTROYED = 'game.factionDestroyed';
}

class TextResourcesError {
	public readonly CONNECTION_FAILED = 'error.connectionfailed';
}

export class Texts {
	public static readonly MAIN_MENU: TextResourcesMainMenu = new TextResourcesMainMenu();
	public static readonly INIT_GAME: TextResourcesInitGame = new TextResourcesInitGame();
	public static readonly GAME: TextResourcesGame = new TextResourcesGame();
	public static readonly ERROR: TextResourcesError = new TextResourcesError();
}

export class TextResources {
	private static _resources: { [key: string]: string; } = {};

	public static initialize() {
		//---- Planet info ---------------
		TextResources._resources[Texts.MAIN_MENU.TITLE] = 'main menu';
		TextResources._resources[Texts.MAIN_MENU.PLAY] = 'play';
		TextResources._resources[Texts.MAIN_MENU.OPTIONS] = 'options';
		TextResources._resources[Texts.MAIN_MENU.QUIT] = 'quit';

		TextResources._resources[Texts.INIT_GAME.TITLE] = 'loading game';
		TextResources._resources[Texts.INIT_GAME.JOINING_GAME] = 'joining game';

		TextResources._resources[Texts.GAME.MAINTAINANCE] = 'maintainance';
		TextResources._resources[Texts.GAME.PRODUCTIVITY] = 'productivity';
		TextResources._resources[Texts.GAME.DEFENSE] = 'defense';
		TextResources._resources[Texts.GAME.FIGHTERS] = 'fighters';

		//---- Infobox --------------
		// player
		TextResources._resources[Texts.GAME.PLAYER_ATTACK_FAILED] = 'Our attack on {0} has failed';
		TextResources._resources[Texts.GAME.PLAYER_PLANET_UNDER_ATTACK] = 'Our base at {0} is under attack by {1}!';
		TextResources._resources[Texts.GAME.PLAYER_REPELLED_ATTACK] = 'Our brave forces could repell the attack on {0}!';
		TextResources._resources[Texts.GAME.PLAYER_CONQUERED_PLANET] = 'Our brave forces conquered {0}!';
		TextResources._resources[Texts.GAME.PLAYER_PLANET_LOST] = 'We lost {0} to {1}';
		TextResources._resources[Texts.GAME.PLAYER_GAME_OVER] = 'Our desperate struggle has come to an end!';

		// factions
		TextResources._resources[Texts.GAME.FACTION_JOINED] = '{0} joined';
		TextResources._resources[Texts.GAME.FACTION_DESTROYED] = '{0} has been eliminated';
		TextResources._resources[Texts.GAME.FACTION_CONQUERED_PLANET] = '{0} conquered {1}';

		TextResources._resources[Texts.ERROR.CONNECTION_FAILED] = 'connection failed';
	}

	public static getText(key: string): string {
		let text = TextResources._resources[key];
		if (text) {
			return text;
		}
		DebugInfo.warn(`${key} not found!`);
		return `[${key}]`;
	}
}
TextResources.initialize();