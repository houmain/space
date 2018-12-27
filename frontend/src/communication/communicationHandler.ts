import { ClientMessage, ClientMessageType, JoinGameMessage, SendSquadron, CommunicationHandler } from './communicationInterfaces';
import { ServerMessageHandler } from './messageHandler';
import { printCallstack } from '../common/error';
import { Engine } from '../common/utils';

export interface SpaceGameConfig {
    url: string;
}

export class CommunicationHandlerWebSocket implements CommunicationHandler {

    private readonly _messageHandler: ServerMessageHandler;

    private _socket: any;

    private _connectionFailed: boolean = false;
    private _connected: boolean = false;

    public constructor(messageHandler: ServerMessageHandler) {
        this._messageHandler = messageHandler;
    }

    public get connected(): boolean {
        return this._connected;
    }

    public get connectionFailed(): boolean {
        return this._connectionFailed;
    }

    public onConnected: Function = null;
    public onDisconnected: Function = null;

    public connect(gameConfig: SpaceGameConfig) {
        try {
            let url = gameConfig.url;
            this._socket = new WebSocket(url, 'websocket');

            this._socket.onopen = () => {

                this._connected = true;
                if (this.onConnected) {
                    this.onConnected();
                }
            };
            this._socket.onclose = () => {
                console.log('Disconnected from server');
                this._connectionFailed = true;

                Engine.instance.events.emit('disconnected');
                /*
                                if (this.onDisconnected) {
                                    this.onDisconnected();
                                }*/
            };
            this._socket.onmessage = (event: any) => {
                try {
                    let msg = JSON.parse(event.data);
                    this._messageHandler.handle(msg);
                } catch (e) {
                    console.log(JSON.stringify(event) + ' exception with ' + event.data);
                    printCallstack(e);
                }
            };
            Object.seal(this._socket);
        } catch (e) {
            printCallstack(e);
            alert(e);
        }
    }

    public send(msg: ClientMessage) {
        try {
            let jsonMessage = JSON.stringify(
                msg
            );
            console.log(`Sending ${jsonMessage} to server.`);
            this._socket.send(jsonMessage);
        } catch (e) {
            printCallstack(e);
            alert(e);
        }
    }

    public close() {
        this._socket.close();
    }
}