import { MessageGameUpdated, ServerMessageType } from '../../communication/communicationInterfaces';
import { ObservableServerMessageHandler } from '../../communication/messageHandler';

export class GameTimeController {

    private _serverTimeSinceStart: number = 0;
    private _timeSinceLastServerTimeUpdate: number = 0;

    public constructor() { //serverMessageObserver: ObservableServerMessageHandler
        //     serverMessageObserver.subscribe<MessageGameUpdated>(ServerMessageType.GAME_UPDATED,
        //        this.updateServerTime.bind(this));
    }

    public updateServerTime(msg: MessageGameUpdated) {
        this._serverTimeSinceStart = msg.time;
        this._timeSinceLastServerTimeUpdate = 0;
    }

    public addLocalElapsedTime(timeElapsed: number) {
        this._timeSinceLastServerTimeUpdate += (timeElapsed * 0.001);
    }

    public get timeSinceStart() {
        return this._serverTimeSinceStart + this._timeSinceLastServerTimeUpdate;
    }
}
