import { CommunicationHandler, JoinGameMessage, ClientMessageType, SendSquadron, ClientMessage, CreateGameMessage, GetAvailableGameSessions, SetupPlayerMessage } from './communicationInterfaces';
import { printCallstack } from '../common/error';
import { NewGameSettings } from '../scenes/createNewGame';

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

	public getAvailableGameSessions() {
		this.send<GetAvailableGameSessions>({
			action: ClientMessageType.REQUEST_GAME_LIST
		});
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

	public joinGame(gameId: number) {
		let msg: JoinGameMessage = {
			action: ClientMessageType.JOIN_GAME,
			gameId: gameId
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

			//factionId: factionId,
			//avatar: playerInfo.avatar,
			//color: playerInfo.color,
			//name: playerInfo.name,
			//faction: playerInfo.factionIcon
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