import { Fighter, Faction, Planet, Squadron } from '../../data/galaxyModels';
import { Observer } from '../../common/commonInterfaces';

export interface GameEventNotifier {
	notify<T extends GameEvent>(eventId: string, event: T);
}

export interface GameEventObserver extends Observer {

	subscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>);

	unsubscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>);
}

export const enum GameEventType {
	PLAYER_JOINED = 'playerJoined',
	FIGHTER_CREATED = 'fighterCreated',
	FIGHTER_DESTROYED = 'fighterDestroyed',
	SQUADRON_CREATED = 'squadronCreated',
	SQUADRON_DESTROYED = 'squadronDestroyed',
	PLANET_CONQUERED = 'planetConquered',
	FACTION_DESTROYED = 'factionDestroyed',
}

export interface HandleGameEvent<T extends GameEvent> {
	(msg: T): void;
}

export interface GameEvent {
	type: string;
}

export interface EventPlayerJoined extends GameEvent {
	faction: Faction;
}

export interface EventFighterCreated extends GameEvent {
	fighter: Fighter;
}

export interface EventFighterDestroyed extends GameEvent {
	fighter: Fighter;
}
export interface EventSquadronCreated extends GameEvent {
	squadron: Squadron;
}

export interface EventSquadronDestroyed extends GameEvent {
	squadron: Squadron;
}

export interface EventPlanetConquered extends GameEvent {
	planet: Planet;
	faction: Faction;
}

export interface EventFactionDestroyed extends GameEvent {
	faction: Faction;
}