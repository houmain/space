import { MessageGameJoined, ServerMessageType, MessageFighterCreated, ClientMessage, ClientMessageType, MessagePlayerJoined, SendSquadron, MessageSquadronSent, MessageFighterDestroyed, MessageSquadronAttacks, MessageSquadronDestroyed, JoinGameMessage, ServerMessage, CreateGameMessage, SendPlayerInfoMessage, PlayerIsReadyMessage } from '../communicationInterfaces';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { CommunicationHandlerMock } from './communicationHandlerMock';
import { DebugInfo } from '../../common/debug';
import { MockMessageBuilder } from './mockMessageBuilder';
import { Planet } from '../../data/galaxyModels';
import { PlanetUtils } from '../../logic/utils/utils';
import { ServerMessageQueue } from '../messageHandler';
import { PlayerJoinedInfoMessage } from '../../view/gameInfo';

class IdGenerator {

	private _currentId = 100;

	public getNextId(): number {
		return ++this._currentId;
	}
}

export class GameServerMock {

	private readonly _client: CommunicationHandlerMock;
	private readonly _galaxyDataHandler: GalaxyDataHandler;

	private _idGenerator: IdGenerator;

	public constructor(communicationHandler: CommunicationHandlerMock, galaxyDataHandler: GalaxyDataHandler) {
		this._client = communicationHandler;
		this._galaxyDataHandler = galaxyDataHandler;
		this._idGenerator = new IdGenerator();
	}

	public receive(clientMessage: ClientMessage) {
		switch (clientMessage.action) {
			case ClientMessageType.CREATE_GAME:
				this.onCreateGame(clientMessage as CreateGameMessage);
				break;
			case ClientMessageType.JOIN_GAME:
				this.onJoinGame(clientMessage as JoinGameMessage);
				break;
			case ClientMessageType.SEND_PLAYER_INFO:
				this.onReceivedPlayerInfo(clientMessage as SendPlayerInfoMessage);
				break;
			case ClientMessageType.PLAYER_READY:
				this.onReceivedPlayerReady(clientMessage as PlayerIsReadyMessage);
				break;
			case ClientMessageType.SEND_SQUADRON:
				this.onSendSquadron(clientMessage as SendSquadron);
				break;
		}
	}

	private sendToClient(msg: ServerMessage, delay: number = 0, onCompleted?: Function) {
		this._client.receive(msg);
		if (delay > 0) {
			setTimeout(() => {
				if (onCompleted) {
					onCompleted();
				}
			}, delay);
		} else {
			if (onCompleted) {
				onCompleted();
			}
		}
	}

	private onCreateGame(msg: CreateGameMessage) {
		DebugInfo.info(`Received createMessage`);

		setTimeout(() => {
			this.sendToClient(MockMessageBuilder.createMessageGameCreated());
		}, 500);
	}

	private onJoinGame(msg: JoinGameMessage) {
		DebugInfo.info(`Received joinMessage, game id: ${msg.gameId}`);

		this.sendToClient(MockMessageBuilder.createMessageGameJoined(), 500, () => {  // TODO remove, send info with start game
			this.sendToClient(MockMessageBuilder.createMessagePlayerJoined());
		});
	}

	private onReceivedPlayerInfo(msg: SendPlayerInfoMessage) {
		DebugInfo.info(`Received player info message` + msg.name);
	}

	private onReceivedPlayerReady(msg: PlayerIsReadyMessage) {
		DebugInfo.info(`Received player ready message` + msg.playerId);

		// todo send start game if all players are ready
		//this.sendToClient(MockMessageBuilder.createMessagePlayerJoined());
	}

	private onSendSquadron(msg: SendSquadron) {
		let squadronId: number = this._idGenerator.getNextId();

		let sourcePlanet: Planet = this._galaxyDataHandler.planets.get(msg.sourcePlanetId);
		let sourceSquadron = PlanetUtils.getSquadronByFactionId(sourcePlanet, sourcePlanet.faction.id);
		let targetPlanet: Planet = this._galaxyDataHandler.planets.get(msg.targetPlanetId);

		this.sendToClient(MockMessageBuilder.createMessageSquadronSent(msg, sourcePlanet.faction.id, sourceSquadron.id, squadronId), 5000, () => {
			if (!targetPlanet.faction || sourcePlanet.faction.id !== targetPlanet.faction.id) { // attack
				this.sendToClient(MockMessageBuilder.createMessageSquadronAttacks(targetPlanet.id, squadronId), 500, () => {
					this.fight(targetPlanet, 0);
				});
			} else { // merge
				let targetSquadron = sourceSquadron = PlanetUtils.getSquadronByFactionId(targetPlanet, sourcePlanet.faction.id);
				this.sendToClient(MockMessageBuilder.createMessageSquadronsMerged(targetPlanet.id, squadronId, targetSquadron.id, msg.fighterCount));
			}
		});
	}

	private fight(planet: Planet, nextInferiourSquadronIndex: number) {
		let squadrons = planet.squadrons.list;

		if (squadrons.length === 1) {

			// Planet conquered
			DebugInfo.info('battle over');
			let oldOwnerId = planet.faction ? planet.faction.id : null;
			let newOwnerId = squadrons[0].faction ? squadrons[0].faction.id : null;

			if (newOwnerId && newOwnerId !== oldOwnerId) {
				this.sendToClient(MockMessageBuilder.createMessagePlanetConquered(planet.id, newOwnerId, oldOwnerId));
			}
		} else {

			for (let s = 0; s < squadrons.length; s++) {
				if (squadrons[s].fighters.length === 0) { // destroySquadron
					this.sendToClient(MockMessageBuilder.createMessageSquadronDestroyed(planet.id, squadrons[s].id), 500, () => {
						this.fight(planet, (nextInferiourSquadronIndex + 1) % squadrons.length);
					});
					return;
				}
			}

			// destroy fighter
			this.sendToClient(MockMessageBuilder.createMessageFighterDestroyed(planet.id,
				squadrons[nextInferiourSquadronIndex].id,
				squadrons[(nextInferiourSquadronIndex + 1) % squadrons.length].id,
			), 500, () => {
				this.fight(planet, (nextInferiourSquadronIndex + 1) % squadrons.length);
			});
		}
	}

	private update() {
		/*this.doNextAction();

		setTimeout(() => {
			this.update();
		}, UPDATE_INTERVALL);*/
	}

	private doNextAction() {
		//this._client.receive(this.createMessageFighterCreated());
	}

	/*

{"event":"squadronAttacks","planetId":7,"squadronId":15}
{"event":"planetConquered","planetId":7,"factionId":1}
{"event":"squadronDestroyed","planetId":7,"squadronId":6}

	*/
}