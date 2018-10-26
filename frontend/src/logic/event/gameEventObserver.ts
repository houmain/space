import { GameEventNotifier, GameEventObserver, HandleGameEvent, GameEvent } from './eventInterfaces';
import { Assert } from '../../common/debug';

export class GameEventObserverImpl implements GameEventNotifier, GameEventObserver {

	private _handlers: { [eventKey: string]: HandleGameEvent<GameEvent>[]; } = {};

	public subscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		if (!this._handlers[eventId]) {
			this._handlers[eventId] = [];
		}
		this._handlers[eventId].push(callback);
		console.log('Event ' + eventId + ' = ' + this._handlers[eventId].length + 'listeners');
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
			subscribers.forEach((notify, index) => {
				console.log('Notify for Event ' + eventId + ' listener ' + (index + 1) + ' from ' + subscribers.length);
				notify(event as T);
			});
		}
	}
}