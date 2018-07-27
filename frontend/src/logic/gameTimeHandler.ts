import { MessageGameUpdated } from '../communication/communicationInterfaces';

export class GameTimeHandler {

    private _serverTimeSinceStart: number;
    private _timeSinceLastServerTimeUpdate: number;

    //TODO: REMOVE
    public updateServerTime(serverTimeSinceStart: number) {
        this._serverTimeSinceStart = serverTimeSinceStart;
        this._timeSinceLastServerTimeUpdate = 0;
    }

    public updateServerTime2(msg: MessageGameUpdated) {
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
