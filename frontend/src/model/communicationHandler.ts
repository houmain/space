import { MessageType, MessageGameJoined, GameMessage, PlanetInfo } from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { Galaxy, Planet } from './galaxy';


import { MessageHandler } from './messageHandler';

export class CommunicationHandler {

    private _socket: any;
    private _messageHandler: MessageHandler;

    public constructor(messageHandler: MessageHandler) {
        this._messageHandler = messageHandler;
    }

    public init() {
        let url = "ws://127.0.0.1:9995/";
        this._socket = new WebSocket(url, "websocket");

        this._socket.onopen = () => {
            console.log("connected");

            this._socket.send('{ "action": "joinGame", "gameId": 0 }');
            this._socket.send('{ "something": 10 }');
            this._socket.send('{ "action": "sendSquadron", sourcePlanetId: 1, targetPlanetId: 2, shipIds: [1,2,3,4] }');
        };
        this._socket.onclose = function () {
            console.log("disonnected");
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
    }

    private instanceOfGameMessage(object: any): object is GameMessage {
        return 'event' in object;
    }
}