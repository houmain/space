export enum Scenes {
	BOOT = 'boot',
	PRELOADER = 'preloader',
	ERROR = 'error',

	MAIN_MENU = 'mainMenu',

	CHOOSE_GAME_TYPE = 'chooseGameType',

	CREATE_NEW_GAME = 'createNewGame',
	SELECT_EXISTING_GAME = 'selectExistingGame',

	CHOOSE_FACTION = 'chooseFaction',
	CHOOSE_AVATAR = 'chooseAvatar',
	CHOOSE_NAME = 'chooseName',

	PLAYER_SETTINGS = 'playerSettings', // remove
	NEW_GAME_SETTINGS = 'newGameSettings', // todo remove

	LOBBY = 'lobby',
	BOT_MENU = 'botMenu',

	INIT_GAME = 'initGame',
	GAME = 'game',
	HUD = 'hud',
}