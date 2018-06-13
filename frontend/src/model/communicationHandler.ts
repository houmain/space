import { MessageType, MessageGameJoined, GameMessage, PlanetInfo } from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { Galaxy, Planet } from './galaxy';

export class GalaxyFactory {
    public static create(planetInfos: PlanetInfo[]): Galaxy {

        let infoMap: { [id: number]: PlanetInfo; } = {};

        planetInfos.forEach(planetInfo => {
            infoMap[planetInfo.id] = planetInfo;
        });

        let galaxy = new Galaxy();

        planetInfos.forEach(planetInfo => {
            let planet = new Planet(planetInfo.id, '');
            galaxy.planets.push(planet);
            console.log('planet created');
        });

        return galaxy;
    }
}

export class MessageHandler {

    private _game: SpaceGame;

    public constructor(game: SpaceGame) {
        this._game = game;
    }

    public handle(msg: GameMessage) {
        try {
            switch (msg.event) {
                case MessageType.GAME_JOINED:
                    console.log('gameJoind!!!')
                    let joinedMessage = msg as MessageGameJoined;
                    console.log(JSON.stringify(msg));
                    let galaxy = GalaxyFactory.create(joinedMessage.planets);
                    this._game.initGalaxy(galaxy);
                    break;
                case MessageType.PLAYER_JOINED:
                    console.log('Player joined');
                    break;
                case MessageType.GAME_UPDATED:
                    console.log('.');
                    break;
                default:
                    console.warn(`Unhandled message found ${JSON.stringify(msg)}`);
                    break;
            }
        } catch (e) {
            console.error(`Exception when handling message ${JSON.stringify(msg)} -> ${e}`);
        }
    }
}

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