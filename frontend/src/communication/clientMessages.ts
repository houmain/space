export enum ClientMessageType {
	REQUEST_GAME_LIST = 'requestGameList',
	CREATE_GAME = 'createGame',
	JOIN_GAME = 'joinGame',
	LEAVE_GAME = 'leaveGame',
	CHAT_MESSAGE = 'chatMessage',
	SETUP_GAME = 'setupGame',
	SETUP_PLAYER = 'setupPlayer',
	SEND_SQUADRON = 'sendSquadron'
}

export interface ClientMessage {
	action: string;
}

export interface RequestGameListMessage extends ClientMessage {

}

export interface CreateGameMessage extends ClientMessage {
	clientId: string;
	name: string;
	password?: string;
	maxPlayers: number;
}

export interface JoinGameMessage extends ClientMessage {
	gameId: number;
}

export interface LeaveGameMessage extends ClientMessage {
}

export interface ChatMessage extends ClientMessage {
	message: string;
}

export interface SetupGameMessage extends ClientMessage {
	numPlanets: number;
	numFactions: number;
}

export interface SetupPlayerMessage extends ClientMessage {
	name: string;
	avatar: string;
	factionId: string;
	color: string;
	ready: boolean;
}

export interface SendSquadron extends ClientMessage {
	sourcePlanetId: number;
	targetPlanetId: number;
	fighterCount: number;
}