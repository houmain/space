import { CommunicationHandler } from './communicationInterfaces';
import { printCallstack } from '../common/error';
import { NewGameSettings } from '../scenes/lobby/createNewGame';
import { RequestGameListMessage, ClientMessageType, CreateGameMessage, JoinGameMessage, LeaveGameMessage, ChatMessage, SetupGameMessage, SetupPlayerMessage, SendSquadron, ClientMessage } from './clientMessages';

export interface SetupGameInfo {
	numFactions: number;
	numPlanets: number;
}

export interface SetupPlayerInfo {
	avatar?: string;
	color?: string;
	name?: string;
	faction?: string;
	ready: boolean;
}

export class ClientMessageSender {

	private _communicationHandler: CommunicationHandler;

	public constructor(communicationHandler: CommunicationHandler) {
		this._communicationHandler = communicationHandler;
	}
	/*
		public getAvailableGameSessions() {
			this.send<GetAvailableGameSessions>({
				action: ClientMessageType.REQUEST_GAME_LIST
			});
		}*/

	public requestGameList() {
		let msg: RequestGameListMessage = {
			action: ClientMessageType.REQUEST_GAME_LIST
		};
		this.send(msg);
	}

	public createGame(settings: NewGameSettings) {
		let msg: CreateGameMessage = {
			action: ClientMessageType.CREATE_GAME,
			clientId: settings.clientId,
			name: settings.name,
			password: settings.password,
			maxPlayers: settings.maxPlayers
		};

		this.send(msg);
	}

	public joinGame(gameId: number, clientId: string, password: string) {
		let msg: JoinGameMessage = {
			action: ClientMessageType.JOIN_GAME,
			gameId: gameId,
			clientId: clientId,
			password: password
		};

		this.send(msg);
	}

	public leaveGame() {
		this.send<LeaveGameMessage>({
			action: ClientMessageType.LEAVE_GAME
		});
	}

	public sendChatMessage(message: string) {
		this.send<ChatMessage>({
			action: ClientMessageType.CHAT_MESSAGE,
			message: message
		});
	}

	public setupGame(gameInfo: SetupGameInfo) {
		let msg: SetupGameMessage = {
			action: ClientMessageType.SETUP_GAME,
			numFactions: gameInfo.numFactions,
			numPlanets: gameInfo.numPlanets
		};
		this.send(msg);
	}

	public setupPlayer(playerInfo: SetupPlayerInfo) {
		let msg: SetupPlayerMessage = {
			action: ClientMessageType.SETUP_PLAYER,
			name: playerInfo.name,
			factionId: playerInfo.faction,
			avatar: playerInfo.avatar,
			color: playerInfo.color,
			ready: playerInfo.ready
		};

		this.send(msg);
	}
	/*
		public sendPlayerInfo(factionId: number, playerInfo: PlayerInfo) {
			let msg: PlayerInfoMessage = {
				action: ClientMessageType.PLAYER_INFO,
				factionId: factionId,
				avatar: playerInfo.avatar,
				color: playerInfo.color,
				name: playerInfo.name,
				faction: playerInfo.factionIcon
			};

			this.send(msg);
		}*/
	/*
		public sendReady() {
			this.send<PlayerReadyMessage>({
				action: ClientMessageType.PLAYER_READY,
				factionId: 0
			});
		}
	*/
	public sendSquadron(sourcePlanetId: number, targetPlanetId: number, fighterCount: number) {
		let msg: SendSquadron = {
			action: ClientMessageType.SEND_SQUADRON,
			sourcePlanetId: sourcePlanetId,
			targetPlanetId: targetPlanetId,
			fighterCount: fighterCount
		};

		this.send(msg);
	}

	private send<T extends ClientMessage>(msg: T) {
		try {
			this._communicationHandler.send(msg);
		} catch (error) {
			printCallstack(error);
			alert(error);
		}
	}
}