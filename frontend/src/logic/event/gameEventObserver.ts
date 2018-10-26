import { GameEventNotifier, GameEventObserver, HandleGameEvent, GameEvent, GameEventType } from './eventInterfaces';
import { Assert } from '../../common/debug';

export class GameEventObserverImpl implements GameEventNotifier, GameEventObserver {

	private _subscribers: { [eventKey: string]: HandleGameEvent<GameEvent>[]; } = {};

	public subscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		if (!this._subscribers[eventId]) {
			this._subscribers[eventId] = [];
		}
		this._subscribers[eventId].push(callback);
	}

	public unsubscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		let index = this._subscribers[eventId].indexOf(callback);
		if (index !== -1) {
			this._subscribers[eventId].splice(index, 1);
		}
	}

	public notify<T extends GameEvent>(eventId: string, event: T) {

		let subscribers = this._subscribers[eventId];
		if (subscribers) {
			subscribers.forEach((notify, index) => {
				notify(event as T);
			});
		}
	}
}