import { GameEventNotifier, GameEventObserver, HandleGameEvent, GameEvent } from './eventInterfaces';

export class GameEventObserverImpl implements GameEventNotifier, GameEventObserver {

	private _handlers: { [eventKey: string]: HandleGameEvent<GameEvent>[]; } = {};

	public subscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		if (!this._handlers[eventId]) {
			this._handlers[eventId] = [];
		}
		this._handlers[eventId].push(callback);
	}

	public unsubscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		let index = this._handlers[eventId].indexOf(callback);
		if (index !== -1) {
			this._handlers[eventId].splice(index, 1);
		}
	}

	public notify<T extends GameEvent>(eventId: string, event: T) {
		let subscribers = this._handlers[eventId];
		if (subscribers) {
			subscribers.forEach(notify => {
				notify(event as T);
			});
		}
	}
}