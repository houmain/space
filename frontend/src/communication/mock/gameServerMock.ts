import { ClientMessage, ClientMessageType, SendSquadron, JoinGameMessage, ServerMessage, CreateGameMessage, PlayerReadyMessage, MessagePlayerInfo, ServerMessageType, GetAvailableGameSessions } from '../communicationInterfaces';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { CommunicationHandlerMock } from './communicationHandlerMock';
import { DebugInfo } from '../../common/debug';
import { MockMessageBuilder } from './mockMessageBuilder';
import { Planet } from '../../data/galaxyModels';
import { PlanetUtils } from '../../logic/utils/utils';

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
			case ClientMessageType.REQUEST_GAME_LIST:
				this.onAvailableGameSessions(clientMessage as GetAvailableGameSessions);
				break;
			case ClientMessageType.JOIN_GAME:
				this.onJoinGame(clientMessage as JoinGameMessage);
				break;
			/*case ClientMessageType.PLAYER_INFO:
				this.onPlayerInfo(clientMessage as PlayerInfoMessage);
				break;
			case ClientMessageType.PLAYER_READY:
				this.onReceivedPlayerReady(clientMessage as PlayerReadyMessage);
				break;*/
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
		//		DebugInfo.info(`Received createMessage num Factions ` + msg.numFactions);

		setTimeout(() => {
			//this.sendToClient(MockMessageBuilder.createMessageGameCreated(this._idGenerator.getNextId()));
		}, 500);
	}

	private onAvailableGameSessions(msg: GetAvailableGameSessions) {
		DebugInfo.info(`Received availableGameSessions`);

		setTimeout(() => {
			this.sendToClient(MockMessageBuilder.createAvailableGameSessions());
		}, 500);
	}

	private _localPlayerId: number = 0;

	private onJoinGame(msg: JoinGameMessage) {
		DebugInfo.info(`Received joinMessage, game id: ${msg.gameId}`);

		setTimeout(() => {
			this._localPlayerId = this._idGenerator.getNextId();
			this.sendToClient(MockMessageBuilder.createMessagePlayerJoined(this._localPlayerId));
		}, 500);

		/*this.sendToClient(MockMessageBuilder.createMessageGameJoined(), 500, () => {  // TODO remove, send info with start game
			this.sendToClient(MockMessageBuilder.createMessagePlayerJoined());
		});*/
	}
	private _numAIPlayers = 3;
	private _aiPlayerIds: number[] = [];
	/*
		private onPlayerInfo(msg: PlayerInfoMessage) {

			setTimeout(() => {
				this.sendToClient(MockMessageBuilder.createMessagePlayerInfo(msg));
			}, 1300);

			// create ai players

			for (let a = 0; a < this._numAIPlayers; a++) {
				setTimeout(() => {
					this._aiPlayerIds.push(this._idGenerator.getNextId());
					this.sendToClient(MockMessageBuilder.createMessagePlayerInfo(
						this.createJoinGameMessageForAiPlayer('faction0' + (a + 2), 'Faction#' + (a + 2), this._aiPlayerIds[this._aiPlayerIds.length - 1])));
				}, 2000 + 1500 * a);
			}
		}

		private createJoinGameMessageForAiPlayer(avatar: string, name: string, factionId: number): PlayerInfoMessage {
			return {
				action: ClientMessageType.PLAYER_INFO,
				color: '0xff0000',
				faction: 'faction01',
				avatar: avatar,
				factionId: factionId,
				name: name
			};
		}*/

	private onReceivedPlayerReady(msg: PlayerReadyMessage) {
		DebugInfo.info(`Received player ready message` + msg.factionId);

		setTimeout(() => {
			this.sendToClient(MockMessageBuilder.createMessagePlayerReady(msg));
		}, 500);

		// if all players ready send start game
		for (let a = 0; a < this._numAIPlayers; a++) {
			let id = this._aiPlayerIds[a];
			setTimeout(() => {
				this.sendToClient(MockMessageBuilder.createMessagePlayerReady({
					action: ServerMessageType.PLAYER_READY,
					factionId: id
				}));
			}, 2000 + 500 * a);
		}

		// todo send start game if all players are ready
		setTimeout(() => {
			this.sendToClient(MockMessageBuilder.createMessageStartGame());
		}, 5000);
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