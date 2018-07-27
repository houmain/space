import { ClientMessage, ClientMessageType, JoinMessage, SendSquadron } from './communicationInterfaces';
import { ServerMessageHandler2 } from './messageHandler';

export class ClientMessageSender {

    private _communicationHandler: CommunicationHandler;

    public constructor(communicationHandler: CommunicationHandler) {
        this._communicationHandler = communicationHandler;
    }

    public joinGame(gameId: number) {
        let msg: JoinMessage = {
            action: ClientMessageType.JOIN_GAME,
            gameId: gameId
        };

        this.send(msg);
    }

    public sendSquadron(sourcePlanetId: number, targetPlanetId: number, fighterCount: number) {
        let msg: SendSquadron = {
            action: ClientMessageType.SEND_SQUADRON,
            sourcePlanetId: sourcePlanetId,
            targetPlanetId: targetPlanetId,
            fighterCount: fighterCount
        };

        this.send(msg);
    }

    private send(msg: ClientMessage) {
        try {
            this._communicationHandler.send(msg);
        } catch (error) {
            alert(error);
        }
    }
}

export interface SpaceGameConfig {
    url: string;
}

export class CommunicationHandler {

    private _socket: any;
    private _messageHandler: ServerMessageHandler2;

    private _connectionFailed: boolean = false;
    private _connected: boolean = false;

    public constructor(messageHandler: ServerMessageHandler2) {
        this._messageHandler = messageHandler;
    }

    public get connected() {
        return this._connected;
    }

    public get connectionFailed() {
        return this._connectionFailed;
    }

    public init(gameConfig: SpaceGameConfig) {
        try {
            let url = gameConfig.url;
            this._socket = new WebSocket(url, 'websocket');

            this._socket.onopen = () => {
                this._connected = true;
            };
            this._socket.onclose = () => {
                console.log('Disonnected from server');
                this._connectionFailed = true;
            };
            this._socket.onmessage = (event: any) => {
                try {
                    let msg = JSON.parse(event.data);
                    this._messageHandler.handle(msg);
                } catch (e) {
                    console.log(JSON.stringify(event) + ' exception with ' + event.data);
                }
            };
            Object.seal(this._socket);
        } catch (e) {
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
            alert(e);
        }
    }

    public close() {
        this._socket.close();
    }
}