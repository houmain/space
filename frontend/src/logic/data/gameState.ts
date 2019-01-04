import { ServerMessageQueue } from '../../communication/messageHandler';
import { GalaxyDataHandler } from './galaxyDataHandler';
import { GameTimeController } from '../controller/gameTimeController';
import { ClientMessageSender } from '../../communication/clientMessageSender';
import { GameEventObserver } from '../event/eventInterfaces';
import { Player } from '../../data/gameData';
import { GameEventObserverImpl } from '../event/gameEventObserver';

export class GameState {
	private readonly _serverMessageQueue: ServerMessageQueue;
	private readonly _timeController: GameTimeController;
	private readonly _clientMessageSender: ClientMessageSender;
	private _gameEventObserver: GameEventObserver = new GameEventObserverImpl();
	private readonly _galaxyDataHandler: GalaxyDataHandler = new GalaxyDataHandler();
	private readonly _player: Player = new Player();

	private _gameId: number;

	private _canSetupGame: boolean;

	public constructor(clientMessageSender: ClientMessageSender, serverMessageQueue: ServerMessageQueue, timeController: GameTimeController) {
		this._clientMessageSender = clientMessageSender;
		this._serverMessageQueue = serverMessageQueue;
		this._timeController = timeController;
	}
	public get serverMessageQueue(): ServerMessageQueue {
		return this._serverMessageQueue;
	}
	public get timeController(): GameTimeController {
		return this._timeController;
	}
	public get clientMessageSender(): ClientMessageSender {
		return this._clientMessageSender;
	}
	public get player(): Player {
		return this._player;
	}
	public get gameId(): number {
		return this._gameId;
	}
	public addGameInfo(joinInfo: { gameId: number, playerId: number, canSetupGame: boolean }) {
		this._gameId = joinInfo.gameId;
		this._player.playerId = joinInfo.playerId;
		this._canSetupGame = joinInfo.canSetupGame;
	}
	public get galaxyDataHandler(): GalaxyDataHandler {
		return this._galaxyDataHandler;
	}
	public get gameEventObserver(): GameEventObserver {
		return this._gameEventObserver;
	}

	public get canSetupGame(): boolean {
		return this._canSetupGame;
	}
}