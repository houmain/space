import { MessageGameUpdated } from '../../communication/serverMessages';

export class GameTimeController {

    private _serverTimeSinceStart: number = 0;
    private _lastServerTimeUpdate: number = 0;
    private _lastClientTimeUpdate: number = 0;

    public timeSinceStart: number = 0;
    public timeSinceLastFrame: number = 0;

    public updateServerTime(msg: MessageGameUpdated) {
        this._serverTimeSinceStart = msg.time;
        this._lastServerTimeUpdate = Date.now();
    }

    public get synchronized() {
        return (this._lastServerTimeUpdate !== 0);
    }

    public updateFrameTime() {
        let now = Date.now();
        this.timeSinceLastFrame =
            (now - this._lastClientTimeUpdate) / 1000.0;
        this._lastClientTimeUpdate = now;
        this.timeSinceStart =
            this._serverTimeSinceStart + (now - this._lastServerTimeUpdate) / 1000.0;
    }
}
