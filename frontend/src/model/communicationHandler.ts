enum MessageType {
    GAME_JOINED = 'gameJoined',
    PLAYER_JOINED = 'playerJoined',
    UPDATE = 'update'
}

export interface GameMessage {
    event: string;
}

export interface MessageGameJoined extends GameMessage {
    planets: PlanetInfo[];
}

export interface PlanetInfo {
    id: number;
    name: string;
    initialAngle: number;
    angularVelocity: number;
    distance: number;
}

export interface MessagePlayerJoined extends GameMessage {
    player: number;
}

export interface MessageUpdate extends GameMessage {
    time: number;
}

export class CommunicationHandler {

    private _socket: any;

    public constructor() {

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
        this._socket.onmessage = function (event: any) {

            try {
                let msg = JSON.parse(event.data);

                switch (msg.event) {
                    case MessageType.GAME_JOINED:
                        console.log('gameJoind!!!')
                        let joinedMessage = msg as MessageGameJoined;
                        console.log(joinedMessage.planets.length + ' Planets');
                        break;
                    default:
                        console.log(event.data);
                        break;
                }
            } catch (e) {
                console.log(JSON.stringify(event) + 'exception with ' + event.data);
            }
        };
        Object.seal(this._socket);
    }
}