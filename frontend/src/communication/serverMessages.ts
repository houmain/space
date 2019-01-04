
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

interface GameInfo {
    gameId: number;
    name: string;
    maxPlayers: number;
    numPlayers: number;
}

export interface MessageGameList extends ServerMessage {
    games: GameInfo[];
}

export interface MessageGameJoined extends ServerMessage {
    gameId: number;
    playerId: number;
    canSetupGame: boolean;
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
    squadrons: SquadronInfo[];
}

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