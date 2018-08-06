import {
    ServerMessageType, ServerMessage, MessageGameJoined, MessagePlayerJoined, MessageGameUpdated, MessageFighterCreated,
    MessageSquadronSent, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronAttacks, MessageSquadronDestroyed,
    MessageSquadronsMerged, MessageFactionDestroyed
} from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { GalaxyFactory } from '../logic/galaxyFactory';
import { Observer } from '../common/commonInterfaces';
import { Galaxy } from '../data/galaxyModels';

export interface HandleServerMessage<T extends ServerMessage> {
    (msg: T): void;
}

export interface ServerMessageHandler {
    handle(msg: ServerMessage);
}

export class ObservableServerMessageHandler implements ServerMessageHandler, Observer {

    private _handlers: { [eventKey: string]: HandleServerMessage<ServerMessage>[]; } = {};

    public subscribe<T extends ServerMessage>(msgType: string, callback: HandleServerMessage<T>) {
        if (!this._handlers[msgType]) {
            this._handlers[msgType] = [];
        }
        this._handlers[msgType].push(callback);
    }

    public unsubscribe<T extends ServerMessage>(msgType: string, callback: HandleServerMessage<T>) {
        let index = this._handlers[msgType].indexOf(callback);
        if (index !== -1) {
            this._handlers[msgType].splice(index, 1);
        }
    }

    public handle(msg: ServerMessage) {
        let subscribers = this._handlers[msg.event];

        if (subscribers) {
            try {
                subscribers.forEach(handle => {
                    handle(msg);
                });
            } catch (e) {
                alert(e);
            }

        } else {
            //     console.warn(`Unhandled message found ${msg.event}`);
        }
    }
}