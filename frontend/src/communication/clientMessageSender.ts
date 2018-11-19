import { CommunicationHandler, JoinGameMessage, ClientMessageType, SendSquadron, ClientMessage, CreateGameMessage } from './communicationInterfaces';
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

	public sendSquadron(sourcePlanetId: number, targetPlanetId: number, fighterCount: number) {
		let msg: SendSquadron = {
			action: ClientMessageType.SEND_SQUADRON,
			sourcePlanetId: sourcePlanetId,
			targetPlanetId: targetPlanetId,
			fighterCount: fighterCount
		};

		this.send(msg);
	}

	private send(msg: ClientMessage) {
		try {
			this._communicationHandler.send(msg);
		} catch (error) {
			printCallstack(error);
			alert(error);
		}
	}
}