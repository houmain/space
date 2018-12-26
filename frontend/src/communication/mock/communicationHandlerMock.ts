import {
    CommunicationHandler, ClientMessage, ClientMessageType, MessageGameJoined,
    ServerMessageType, FactionInfo, PlanetInfo, MessageFighterCreated, ServerMessage
} from '../communicationInterfaces';
import { SpaceGameConfig } from '../communicationHandler';
import { ServerMessageHandler, ServerMessageQueue } from '../messageHandler';
import { GalaxyDataHandler } from '../../logic/data/galaxyDataHandler';
import { GameServerMock } from './gameServerMock';
import { DebugInfo } from '../../common/debug';

export class CommunicationHandlerMock implements CommunicationHandler {

    private _messageHandler: ServerMessageHandler;
    private _gameServer: GameServerMock;

    public onDisconnected: Function;
    public onServerMessage: Function;

    public constructor(messageHandler: ServerMessageHandler, galaxyDataHandler: GalaxyDataHandler) {
        this._messageHandler = messageHandler;
        this._gameServer = new GameServerMock(this, galaxyDataHandler);
    }

    public connect(gameConfig: SpaceGameConfig) {
        DebugInfo.debug('Init CommunicationHandlerMock ' + JSON.stringify(gameConfig));
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
        //  this._serverMessageQeue.queueMessage(msg);
    }

    public close() {
        console.log('Closed CommunicationHandlerMock');
    }
}
