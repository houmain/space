export enum GameEventType {
	FIGHTER_CREATED = 'fighterCreated',
	FIGHTER_DESTROYED = 'fighterDestroyed'
}


export interface HandleGameEvent<T extends GameEvent> {
	(msg: T): void;
}

export interface GameEvent {

}

export interface FighterCreated extends GameEvent {

}

export interface FighterDestroyed extends GameEvent {

}

