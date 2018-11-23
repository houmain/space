import { ServerMessage, ServerMessageType, MessageGameUpdated } from './communicationInterfaces';
import { Observer } from '../common/commonInterfaces';
import { printCallstack } from '../common/error';
import { GameTimeController } from '../logic/controller/gameTimeController';

export class ServerMessageQueue {

    private _queuedMessages: ServerMessage[] = [];
    private _subscribers: { [eventKey: string]: HandleServerMessage<ServerMessage>[]; } = {};

    public subscribe<T extends ServerMessage>(msgType: string, callback: HandleServerMessage<T>) {
        if (!this._subscribers[msgType]) {
            this._subscribers[msgType] = [];
        }
        this._subscribers[msgType].push(callback);
    }

    public queueMessage(msg: ServerMessage) {
        this._queuedMessages.push(msg);
    }

    public handleMessages() {
        if (this._queuedMessages.length > 0) {
            while (this._queuedMessages.length > 0) {
                let nextMsg = this._queuedMessages.shift();
                this.informSubscribers(nextMsg);
            }
        }
    }

    private informSubscribers(msg: ServerMessage) {
        let subscribers = this._subscribers[msg.event];

        if (subscribers) {
            try {
                subscribers.forEach(handle => {
                    handle(msg);
                });
            } catch (e) {
                printCallstack(e);
                alert(e);
            }
        } else {
            console.warn(`Unhandled message found ${msg.event}`);
        }
    }
}

export interface HandleServerMessage<T extends ServerMessage> {
    (msg: T): void;
}

export interface ServerMessageHandler {
    handle(msg: ServerMessage);
}

export class ObservableServerMessageHandler implements ServerMessageHandler, Observer {

    private _serverMessageQueue: ServerMessageQueue;
    private _gameTimeController: GameTimeController;

    private _handlers: { [eventKey: string]: HandleServerMessage<ServerMessage>[]; } = {};

    public constructor(serverMessageQueue: ServerMessageQueue, gameTimeController: GameTimeController) {
        this._serverMessageQueue = serverMessageQueue;
        this._gameTimeController = gameTimeController;
    }

    // deprecated
    public subscribe<T extends ServerMessage>(msgType: string, callback: HandleServerMessage<T>) {
        if (!this._handlers[msgType]) {
            this._handlers[msgType] = [];
        }
        this._handlers[msgType].push(callback);
    }
    // deprecated
    public unsubscribe<T extends ServerMessage>(msgType: string, callback: HandleServerMessage<T>) {
        let index = this._handlers[msgType].indexOf(callback);
        if (index !== -1) {
            this._handlers[msgType].splice(index, 1);
        }
    }

    public handle(msg: ServerMessage) {
        if (msg.event === ServerMessageType.GAME_UPDATED) {
            this._gameTimeController.updateServerTime(msg as MessageGameUpdated);
        } else {
            this._serverMessageQueue.queueMessage(msg);
        }
        /*let subscribers = this._handlers[msg.event];

        if (subscribers) {
            try {
                subscribers.forEach(handle => {
                    handle(msg);
                });
            } catch (e) {
                printCallstack(e);
                alert(e);
            }
        } else {
            console.warn(`Unhandled message found ${msg.event}`);
        }*/
    }
}