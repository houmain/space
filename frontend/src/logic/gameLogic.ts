import { GalaxyHandler } from './galaxyHandler';
import { ServerMessageObserver } from '../communication/messageHandler';
import { MessageGameJoined, ServerMessageType } from '../communication/communicationInterfaces';
import { GalaxyFactory } from './galaxyFactory';
import { Player, GameState } from '../data/gameData';
import { Galaxy } from '../data/galaxyModels';

export class GameLogic {

	private _galaxyHandler: GalaxyHandler;
	private _player: Player;
	private _galaxy: Galaxy;

	public constructor(gameState: GameState, serverMessageObserver: ServerMessageObserver) {
		this._player = gameState.player;
		this._galaxy = gameState.galaxy;

		this._galaxyHandler = new GalaxyHandler();

		/*serverMessageObserver.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined);
        serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated);
        this._serverMessageObserver.subscribe<MessageSquadronSent>(ServerMessageType.SQUADRON_SENT, this.onSquadronSent);
        this._serverMessageObserver.subscribe<MessageSquadronsMerged>(ServerMessageType.SQUADRONS_MERGED, this.onSquadronsMerged);
        this._serverMessageObserver.subscribe<MessageSquadronAttacks>(ServerMessageType.SQUADRON_ATTACKS, this.onSquadronAttacks);
        this._serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed);
        this._serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered);
        this._serverMessageObserver.subscribe<MessageSquadronDestroyed>(ServerMessageType.SQUADRON_DESTROYED, this.onSquadronDestroyed);*/
	}

	private onGameJoined(msg: MessageGameJoined) {
		console.log('onGameJoined ');

		this._player.factionId = msg.factionId;

		GalaxyFactory.create(this._galaxy, msg.factions, msg.planets, msg.squadrons);
		this._galaxyHandler.init(this._galaxy);
	}
}
