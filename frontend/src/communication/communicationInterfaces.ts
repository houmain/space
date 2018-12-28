import { SpaceGameConfig } from './communicationHandler';

export interface CommunicationHandler {

    onConnected: Function;
    onDisconnected: Function;

    connect(gameConfig: SpaceGameConfig);
    send(msg: ClientMessage);
    close();
}

export enum ClientMessageType {
    REQUEST_GAME_LIST = 'requestGameList',
    CREATE_GAME = 'createGame',
    JOIN_GAME = 'joinGame',
    LEAVE_GAME = 'leaveGame',
    CHAT_MESSAGE = 'chatMessage',
    SETUP_GAME = 'setupGame',
    SETUP_PLAYER = 'setupPlayer',
    //PLAYER_INFO = 'playerInfo',
    //PLAYER_READY = 'playerReady',
    SEND_SQUADRON = 'sendSquadron'
}

export interface ClientMessage {
    action: string;
}

export interface RequestGameListMessage extends ClientMessage {

}

export interface CreateGameMessage extends ClientMessage {
    clientId: string;
    name: string;
    password?: string;
    maxPlayers: number;
}

export interface JoinGameMessage extends ClientMessage {
    gameId: number;
}

export interface LeaveGameMessage extends ClientMessage {
}

export interface ChatMessage extends ClientMessage {
    message: string;
}

export interface SetupGameMessage extends ClientMessage {
    numPlanets: number;
    numFactions: number;
}

export interface SetupPlayerMessage extends ClientMessage {
    name: string;
    avatar: string;
    factionId: string;
    color: string;
    ready: boolean;
}

/*
export interface GetAvailableGameSessions extends ClientMessage {
}
*/



/*
export interface PlayerInfoMessage extends ClientMessage {
    factionId: number;
    name: string;
    avatar: string;
    faction: string;
    color: string;
}
*//*
export interface PlayerReadyMessage extends ClientMessage {
    factionId: number;
}

export interface MessageStartGame extends ServerMessage {
    planets: PlanetInfo[];
    factions: FactionInfo[];
    squadrons: SquadronInfo[];
    factionId: number;
}
*/
export interface SendSquadron extends ClientMessage {
    sourcePlanetId: number;
    targetPlanetId: number;
    fighterCount: number;
}

export enum ServerMessageType {
    // LOBBY
    GAME_LIST = 'gameList',
    GAME_JOINED = 'gameJoined',
    PLAYER_JOINED = 'playerJoined',
    GAME_LEFT = 'gameLeft',
    PLAYER_LEFT = 'playerLeft',
    CHAT_MESSAGE = 'chatMessage',
    GAME_SETUP_UPDATED = 'gameSetupUpdated',
    PLAYER_SETUP_UPDATED = 'playerSetupUpdated',
    GAME_STARTED = 'gameStarted',

    /*
        GAME_CREATED = 'gameCreated',
        AVAILABLE_SESSIONS = 'availableSessions',
    
        PLAYER_INFO = 'playerInfo',
        PLAYER_READY = 'playerReady',
        START_GAME = 'startGame',
    
    */

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

export interface MessageGameList extends ServerMessage {
    //todo
}

export interface MessageGameJoined extends ServerMessage {
    gameId: number;
    playerId: number;
}

export interface MessagePlayerJoined extends ServerMessage {
    playerId: number;
}

export interface MessageGameLeft extends ServerMessage {
}

export interface MessagePlayerLeft extends ServerMessage {
    playerId: number;
}

export interface MessageChatMessage extends ServerMessage {
    playerId: number;
    message: string;
}

export interface MessageGameSetupUpdated extends ServerMessage {
    numPlanets: number;
    numFactions: number;
}

export interface MessagePlayerSetupUpdated extends ServerMessage {
    playerId: number;
    name: string;
    avatar: string;
    factionId: string;
    color: string;
    ready: boolean;
}

export interface MessageGameStarted extends ServerMessage {
    factions: FactionInfo[];
    planets: PlanetInfo[];
    movingSquadrons: SquadronInfo[];
}

/*
export interface MessageAvailableGameSessions extends ServerMessage {
    sessions: SessionInfo[];
}

export interface MessageGameCreated extends ServerMessage {
    gameId: number;
}
*/

/*
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
*/

export interface SessionInfo {
    gameId: number;
    name: string;
    maxPlayers: number;
    numPlayers: number;
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