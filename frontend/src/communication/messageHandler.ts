import { ServerMessageType, ServerMessage, MessageGameJoined, MessagePlayerJoined, MessageGameUpdated, MessageFighterCreated, MessageSquadronSent, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronAttacks, MessageSquadronDestroyed, MessageSquadronsMerged } from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { GalaxyFactory } from '../model/galaxyFactory';

export interface MessageHandlerServerTimeUpdate {
    (timeSinceStart: number): void;
}

export class ServerMessageHandler {

    private _game: SpaceGame;

    private _onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate = (timeSinceStart: number) => {
        console.log('update');
    }

    public constructor(game: SpaceGame) {
        this._game = game;
    }

    public set onMessageHandlerServerTimeUpdate(onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate) {
        this._onMessageHandlerServerTimeUpdate = onMessageHandlerServerTimeUpdate;
    }

    public handle(msg: ServerMessage) {
        try {
            switch (msg.event) {
                case ServerMessageType.GAME_JOINED:
                    console.log('gameJoined!!!');
                    let joinedMessage = msg as MessageGameJoined;
                    console.log(JSON.stringify(msg));
                    let galaxy = GalaxyFactory.create(joinedMessage.factions, joinedMessage.planets, joinedMessage.squadrons);
                    this._game.initGalaxy(galaxy);
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
                default:
                    console.warn(`Unhandled message found ${JSON.stringify(msg)}`);
                    break;
            }
        } catch (e) {
            console.error(`Exception when handling message ${JSON.stringify(msg)} -> ${e}`);
        }
    }
}