import { CommunicationHandler, JoinGameMessage, ClientMessageType, SendSquadron, ClientMessage, CreateGameMessage, PlayerReadyMessage, PlayerInfoMessage, GetAvailableGameSessions } from './communicationInterfaces';
import { printCallstack } from '../common/error';
import { NewGameSettings } from '../scenes/newGameSettings';

export interface PlayerInfo {
	avatar: string;
	color: string;
	name: string;
	factionIcon: string;
}

export class ClientMessageSender {

	private _communicationHandler: CommunicationHandler;

	public constructor(communicationHandler: CommunicationHandler) {
		this._communicationHandler = communicationHandler;
	}

	public getAvailableGameSessions() {
		this.send<GetAvailableGameSessions>({
			action: ClientMessageType.AVAILABLE_GAME_SESSIONS
		});
	}

	public createGame(settings: NewGameSettings) {
		let msg: CreateGameMessage = {
			action: ClientMessageType.CREATE_GAME,
			numFactions: settings.numFactions,
			numPlanets: settings.numPlanets
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
	}

	public sendReady() {
		this.send<PlayerReadyMessage>({
			action: ClientMessageType.PLAYER_READY,
			factionId: 0
		});
	}

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