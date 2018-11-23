import { CommunicationHandler, JoinGameMessage, ClientMessageType, SendSquadron, ClientMessage, CreateGameMessage, SendPlayerInfoMessage, PlayerIsReadyMessage } from './communicationInterfaces';
import { printCallstack } from '../common/error';
import { NewGameSettings } from '../scenes/newGameSettings';

export class ClientMessageSender {

	private _communicationHandler: CommunicationHandler;

	public constructor(communicationHandler: CommunicationHandler) {
		this._communicationHandler = communicationHandler;
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

	public sendPlayerInfo() {
		this.send<SendPlayerInfoMessage>({
			action: ClientMessageType.SEND_PLAYER_INFO,
			avatar: 'faction01',
			color: '0xff0000',
			name: 'berni',
			gameId: 0,
			faction: 'faction1',
			playerId: 0
		});
	}

	public sendReady() {
		this.send<PlayerIsReadyMessage>({
			action: ClientMessageType.PLAYER_READY,
			playerId: 0
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