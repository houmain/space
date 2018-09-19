import {
    CommunicationHandler, ClientMessage, ClientMessageType, MessageGameJoined,
    ServerMessageType, FactionInfo, PlanetInfo, MessageFighterCreated, ServerMessage
} from '../communicationInterfaces';
import { SpaceGameConfig } from '../communicationHandler';
import { ServerMessageHandler } from '../messageHandler';
import { GalaxyDataHandler } from '../../logic/galaxyDataHandler';
import { GameServerMock } from './gameServerMock';

const UPDATE_INTERVALL = 1000;

export class CommunicationHandlerMock implements CommunicationHandler {

    private _messageHandler: ServerMessageHandler;
    private _gameServer: GameServerMock;

    public onDisconnected: Function;
    public onServerMessage: Function;

    public constructor(messageHandler: ServerMessageHandler, galaxyDataHandler: GalaxyDataHandler) {
        this._messageHandler = messageHandler;
        this._gameServer = new GameServerMock(this, galaxyDataHandler);
    }

    public init(gameConfig: SpaceGameConfig) {
        console.log('Init CommunicationHandlerMock ' + JSON.stringify(gameConfig));
    }

    public set onConnected(func: Function) {
        setTimeout(() => {
            func();
        }, 300);
    }

    public send(msg: ClientMessage) {
        this._gameServer.receive(msg);
    }

    public receive(msg: ServerMessage) {
        this._messageHandler.handle(msg);
    }

    public close() {
        console.log('Closed CommunicationHandlerMock');
    }
}
