export enum MessageType {
    GAME_JOINED = 'gameJoined',
    PLAYER_JOINED = 'playerJoined',
    GAME_UPDATED = 'gameUpdated',
    FIGHTER_CREATED = 'fighterCreated'
}

export interface GameMessage {
    event: string;
}

export interface MessageGameJoined extends GameMessage {
    planets: PlanetInfo[];
    factions: FactionInfo[];
}

export interface PlanetInfo {
    id: number;
    name: string;
    initialAngle: number;
    angularVelocity: number;
    distance: number;
    parent: number;
    owner: number;
    squadrons: SquadronInfo[];
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

export interface MessagePlayerJoined extends GameMessage {
    factionId: number;
}

export interface MessageGameUpdated extends GameMessage {
    time: number;
}

export interface MessageFighterCreated extends GameMessage {
    planetId: number;
    squadronId: number;
    fighterCount: number;
}