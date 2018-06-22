import { ServerMessageType, ServerMessage, MessageGameJoined, MessagePlayerJoined, MessageGameUpdated } from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { GalaxyFactory } from '../model/galaxyFactory';

export interface MessageHandlerServerTimeUpdate {
    (timeSinceStart: number): void;
}

export class ServerMessageHandler {

    private _game: SpaceGame;

    private _onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate = (timeSinceStart: number) => {
        console.log('update');
    }

    public constructor(game: SpaceGame) {
        this._game = game;
    }

    public set onMessageHandlerServerTimeUpdate(onMessageHandlerServerTimeUpdate: MessageHandlerServerTimeUpdate) {
        this._onMessageHandlerServerTimeUpdate = onMessageHandlerServerTimeUpdate;
    }

    public handle(msg: ServerMessage) {
        try {
            switch (msg.event) {
                case ServerMessageType.GAME_JOINED:
                    console.log('gameJoined!!!');
                    let joinedMessage = msg as MessageGameJoined;
                    console.log(JSON.stringify(msg));
                    let galaxy = GalaxyFactory.create(joinedMessage.factions, joinedMessage.planets);
                    this._game.initGalaxy(galaxy);
                    break;
                case ServerMessageType.PLAYER_JOINED:
                    let playerJoinedMessage = msg as MessagePlayerJoined;
                    console.log('Player joined ' + playerJoinedMessage.factionId);
                    break;
                case ServerMessageType.GAME_UPDATED:
                    let gameUpdatedMessage = msg as MessageGameUpdated;
                    this._onMessageHandlerServerTimeUpdate(gameUpdatedMessage.time);
                    break;
                case ServerMessageType.FIGHTER_CREATED:
                    //  console.log('fighter created');
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