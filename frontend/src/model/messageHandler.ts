import { MessageType, GameMessage, MessageGameJoined, MessagePlayerJoined, MessageGameUpdated } from './communicationInterfaces';
import { SpaceGame } from '../Game';
import { GalaxyFactory } from './galaxy';

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
                    let galaxy = GalaxyFactory.create(joinedMessage.factions, joinedMessage.planets);
                    this._game.initGalaxy(galaxy);
                    break;
                case MessageType.PLAYER_JOINED:
                    let playerJoinedMessage = msg as MessagePlayerJoined;
                    console.log('Player joined ' + playerJoinedMessage.factionId);
                    break;
                case MessageType.GAME_UPDATED:
                    let gameUpdatedMessage = msg as MessageGameUpdated;
                    this._game.timeSinceStart = gameUpdatedMessage.time;
                    console.log('.');
                    break;
                case MessageType.FIGHTER_CREATED:
                    console.log('fighter created');
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
