import {
    ServerMessageType, ServerMessage, MessageGameJoined, MessagePlayerJoined, MessageGameUpdated, MessageFighterCreated,
    MessageSquadronSent, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronAttacks, MessageSquadronDestroyed,
    MessageSquadronsMerged, MessageFactionDestroyed
} from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { GalaxyFactory } from '../logic/galaxyFactory';
import { Observer } from '../common/commonInterfaces';
import { Galaxy } from '../data/galaxyModels';

//TODO: REMOVE
export interface MessageHandlerServerTimeUpdate {
    (timeSinceStart: number): void;
}

export interface ServerMessageHandlerino<T extends ServerMessage> {
    (msg: T): void;
}

export interface ServerMessageHandler2 {
    handle(msg: ServerMessage);
}

// TODO: rename ServerMessageObserver to ServerMessageHandler
export class ServerMessageObserver implements ServerMessageHandler2, Observer {

    private _handlers: { [eventKey: string]: ServerMessageHandlerino<ServerMessage>[]; } = {};

    public subscribe<T extends ServerMessage>(msgType: string, callback: ServerMessageHandlerino<T>) {
        if (!this._handlers[msgType]) {
            this._handlers[msgType] = [];
        }
        this._handlers[msgType].push(callback);
    }

    public unsubscribe<T extends ServerMessage>(msgType: string, callback: ServerMessageHandlerino<T>) {
        let index = this._handlers[msgType].indexOf(callback);
        if (index !== -1) {
            this._handlers[msgType].splice(index, 1);
        }
    }

    public handle(msg: ServerMessage) {
        let subscribers = this._handlers[msg.event];

        if (subscribers) {
            try {
                subscribers.forEach(handle => {
                    handle(msg);
                });
            } catch (e) {
                alert(e);
            }

        } else {
            //     console.warn(`Unhandled message found ${msg.event}`);
        }
    }
}
// todo remove
export class ServerMessageHandler {

    private _game: SpaceGame;

    private _handlers: { [eventKey: string]: ServerMessageHandlerino<ServerMessage>[]; } = {};

    private handleMessageGameJoined(msg: MessageGameJoined) {
        console.log('XXXXXXXXXXXXXXX' + JSON.stringify(msg));
    }

    private _onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate = (timeSinceStart: number) => {
        console.log('update');
    }

    public constructor(game: SpaceGame) {
        this._game = game;

        this._handlers[ServerMessageType.GAME_JOINED] = [];
        this._handlers[ServerMessageType.GAME_JOINED].push(this.handleMessageGameJoined);
    }

    public set onMessageHandlerServerTimeUpdate(onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate) {
        this._onMessageHandlerServerTimeUpdate = onMessageHandlerServerTimeUpdate;
    }

    public handle(msg: ServerMessage) {
        try {
            switch (msg.event) {
                case ServerMessageType.GAME_JOINED:
                    let joinedMessage = msg as MessageGameJoined;
                    console.log(JSON.stringify(msg));
                    this._game.gameJoined(joinedMessage.factionId);
                    let galaxy = GalaxyFactory.create(new Galaxy(), joinedMessage.factions, joinedMessage.planets, joinedMessage.squadrons);
                    this._game.initGalaxy(galaxy);

                    let handlerinos = this._handlers[ServerMessageType.GAME_JOINED];
                    handlerinos.forEach(handlerino => {
                        handlerino(msg);
                    });

                    break;
                case ServerMessageType.PLAYER_JOINED:
                    let playerJoinedMessage = msg as MessagePlayerJoined;
                    console.log('Player joined ' + playerJoinedMessage.factionId);
                    break;
                case ServerMessageType.GAME_UPDATED:
                    let gameUpdatedMessage = msg as MessageGameUpdated;
                    this._onMessageHandlerServerTimeUpdate(gameUpdatedMessage.time);
                    break;
                case ServerMessageType.FIGHTER_CREATED:
                    let fighterCreatedMessage = msg as MessageFighterCreated;
                    this._game.createFighter(fighterCreatedMessage.planetId, fighterCreatedMessage.squadronId, fighterCreatedMessage.fighterCount);
                    break;
                case ServerMessageType.SQUADRON_SENT:
                    console.log('SQUADRON_SENT' + JSON.stringify(msg));
                    let squadronSentEvent = msg as MessageSquadronSent;
                    this._game.squadronSent(
                        squadronSentEvent.factionId,
                        squadronSentEvent.sourcePlanetId, squadronSentEvent.sourceSquadronId, squadronSentEvent.targetPlanetId,
                        squadronSentEvent.squadronId, squadronSentEvent.fighterCount);
                    break;
                case ServerMessageType.SQUADRONS_MERGED:
                    console.log('SQUADRONS_MERGED' + JSON.stringify(msg));
                    let smm = msg as MessageSquadronsMerged;
                    this._game.squadronsMerged(smm.planetId, smm.squadronId, smm.intoSquadronId, smm.fighterCount);
                    break;
                case ServerMessageType.SQUADRON_ATTACKS:
                    console.log('SQUADRON_ATTACKS' + JSON.stringify(msg));
                    let sam = msg as MessageSquadronAttacks;
                    this._game.squadronAttacks(sam.planetId, sam.squadronId);
                    break;
                case ServerMessageType.FIGHTER_DESTROYED:
                    console.log('FIGHTER_DESTROYED' + JSON.stringify(msg));
                    let fdm = msg as MessageFighterDestroyed;
                    this._game.fighterDestroyed(fdm.planetId, fdm.squadronId, fdm.fighterCount, fdm.bySquadronId);
                    break;
                case ServerMessageType.PLANET_CONQUERED:
                    console.log('PLANET_CONQUERED' + JSON.stringify(msg));
                    let pqm = msg as MessagePlanetConquered;
                    this._game.planetConquered(pqm.factionId, pqm.planetId);
                    break;
                case ServerMessageType.SQUADRON_DESTROYED:
                    let sdm = msg as MessageSquadronDestroyed;
                    this._game.squadronDestroyed(sdm.planetId, sdm.squadronId);
                    console.log('SQUADRON_DESTROYED' + JSON.stringify(msg));
                    break;
                case ServerMessageType.FACTION_DESTROYED:
                    let fd = msg as MessageFactionDestroyed;
                    this._game.factionDestroyed(fd.factionId);
                    break;
                default:
                    console.warn(`Unhandled message found ${JSON.stringify(msg)}`);
                    break;
            }
        } catch (e) {
            console.error(`Exception when handling message ${JSON.stringify(msg)} -> ${e}`);
        }
    }
}