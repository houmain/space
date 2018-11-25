import { SpaceGameConfig } from './communicationHandler';
import { ServerMessageHandler } from './messageHandler';

export interface CommunicationHandler {

    onConnected: Function;
    onDisconnected: Function;

    init(gameConfig: SpaceGameConfig);
    send(msg: ClientMessage);
    close();
}

export enum ClientMessageType {
    CREATE_GAME = 'createGame',
    JOIN_GAME = 'joinGame',
    PLAYER_INFO = 'playerInfo',
    PLAYER_READY = 'playerReady',
    SEND_SQUADRON = 'sendSquadron'
}

export interface ClientMessage {
    action: string;
}

export interface CreateGameMessage extends ClientMessage {
    numPlanets: number;
    numFactions: number;
}

export interface JoinGameMessage extends ClientMessage {
    gameId: number;
}

export interface PlayerInfoMessage extends ClientMessage {
    factionId: number;
    name: string;
    avatar: string;
    faction: string;
    color: string;
}

export interface PlayerReadyMessage extends ClientMessage {
    factionId: number;
}

export interface MessageStartGame extends ServerMessage {
    lanets: PlanetInfo[];
    factions: FactionInfo[];
    squadrons: SquadronInfo[];
    factionId: number;
}

export interface SendSquadron extends ClientMessage {
    sourcePlanetId: number;
    targetPlanetId: number;
    fighterCount: number;
}

export enum ServerMessageType {
    // LOBBY
    GAME_CREATED = 'gameCreated',
    PLAYER_JOINED = 'playerJoined',
    PLAYER_INFO = 'playerInfo',
    PLAYER_READY = 'playerReady',
    START_GAME = 'startGame',

    GAME_JOINED = 'gameJoined',    // remove, replaced by start game

    // GAME
    GAME_UPDATED = 'gameUpdated',
    FIGHTER_CREATED = 'fighterCreated',
    SQUADRON_SENT = 'squadronSent',
    SQUADRONS_MERGED = 'squadronsMerged',
    SQUADRON_ATTACKS = 'squadronAttacks',
    FIGHTER_DESTROYED = 'fighterDestroyed',
    PLANET_CONQUERED = 'planetConquered',
    SQUADRON_DESTROYED = 'squadronDestroyed',
    FACTION_DESTROYED = 'factionDestroyed',
    FACTION_WON = 'factionWon'
}

export interface ServerMessage {
    event: string;
}
export interface MessageGameCreated extends ServerMessage {
    gameId: number;
}

export interface MessagePlayerJoined extends ServerMessage {
    factionId: number;
}

export interface MessagePlayerInfo extends ServerMessage {
    factionId: number;
    name: string;
    avatar: string;
    faction: string;
    color: string;
}

export interface MessagePlayerReady extends ServerMessage {
    factionId: number;
}

export interface MessageGameJoined extends ServerMessage {
    planets: PlanetInfo[];
    factions: FactionInfo[];
    squadrons: SquadronInfo[];
    factionId: number;
}

export interface PlanetInfo {
    id: number;
    name: string;
    initialAngle: number;
    angularVelocity: number;
    distance: number;
    parent: number;
    faction: number;
    squadrons: SquadronInfo[];
    maxUpkeep: number;
    productionRate: number;
    productionProgress: number;
    defenseBonus: number;
}

export interface FactionInfo {
    id: number;
    name: string;
}

export interface SquadronInfo {
    squadronId: number;
    fighterCount: number;
    factionId: number;
}

export interface MessageGameUpdated extends ServerMessage {
    time: number;
}

export interface MessageFighterCreated extends ServerMessage {
    planetId: number;
    squadronId: number;
    fighterCount: number;
}

export interface MessageSquadronSent extends ServerMessage {
    factionId: number;
    sourcePlanetId: number;
    sourceSquadronId: number;
    targetPlanetId: number;
    squadronId: number;
    fighterCount: number;
    speed: number;
}

export interface MessageSquadronsMerged extends ServerMessage {
    planetId: number;
    squadronId: number;
    intoSquadronId: number;
    fighterCount: number;
}

export interface MessageSquadronAttacks extends ServerMessage {
    planetId: number;
    squadronId: number;
}

export interface MessageFighterDestroyed extends ServerMessage {
    planetId: number;
    squadronId: number;
    fighterCount: number;
    bySquadronId: number;
}

export interface MessagePlanetConquered extends ServerMessage {
    planetId: number;
    factionId: number;
    fromFactionId: number;
}

export interface MessageSquadronDestroyed extends ServerMessage {
    planetId: number;
    squadronId: number;
}

export interface MessageFactionDestroyed extends ServerMessage {
    factionId: number;
}

export interface MessageFactionWon extends ServerMessage {
    factionId: number;
}