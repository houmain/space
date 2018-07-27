'use strict';
//https://gamedevacademy.org/how-to-create-a-game-hud-plugin-in-phaser/
import 'phaser';
import { Preloader } from './scenes/preloader';
import { Main } from './scenes/main';
import { GameTimeHandler } from './logic/gameTimeHandler';
import { CommunicationHandler, ClientMessageSender, SpaceGameConfig } from './communication/communicationHandler';
import { ServerMessageObserver } from './communication/messageHandler';
import { Galaxy, Faction, Squadron, Fighter } from './data/galaxyModels';
import { GameScene } from './scenes/game';
import { HudScene } from './scenes/hud';
import { GalaxyHandler } from './logic/galaxyHandler';
import { ServerMessageType, MessageGameJoined, MessageGameUpdated, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFactionDestroyed, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed } from './communication/communicationInterfaces';
import { GalaxyFactory } from './logic/galaxyFactory';
import { InitGameScene } from './scenes/initGame';
import { States } from './scenes/states';
import { Engine, Assert } from './common/utils';
import { Player } from './data/gameData';

export class SpaceGame extends Phaser.Game {

    private _communicationHandler: CommunicationHandler;
    private _serverMessageObserver: ServerMessageObserver;
    private _gameTimeHandler: GameTimeHandler;
    private _clientMessageSender: ClientMessageSender;

    private _galaxy: Galaxy;
    private _galaxyHandler: GalaxyHandler;

    private _player: Player;

    constructor(config: GameConfig) {
        super(config);

        Engine.init(this);

        this._serverMessageObserver = new ServerMessageObserver();
        this._communicationHandler = new CommunicationHandler(this._serverMessageObserver);
        this._clientMessageSender = new ClientMessageSender(this._communicationHandler);
        this._gameTimeHandler = new GameTimeHandler(this._serverMessageObserver);

        let gameConfig: SpaceGameConfig = {
            url: 'ws://127.0.0.1:9995/'
        };

        this._player = new Player();
        this._galaxy = new Galaxy();

        this.scene.add(States.PRELOADER, new Preloader(this, gameConfig, this._communicationHandler, this._clientMessageSender), true);
        this.scene.add(States.MAIN, new Main(this, this._gameTimeHandler, this._clientMessageSender));
        this.scene.add(States.INIT_GAME, new InitGameScene(this, this._clientMessageSender, this._serverMessageObserver));
        this.scene.add(States.GAME, new GameScene(this._gameTimeHandler, this._clientMessageSender));
        this.scene.add(States.HUD, new HudScene());
    }

    public get communcationHandler(): CommunicationHandler {
        return this._communicationHandler;
    }

    public get galaxy(): Galaxy {
        return this._galaxy;
    }

    public get player(): Player {
        return this._player;
    }


    public resize(width: number, height: number) {
        console.log(`TODO: should resize to ${width} and ${height}`);
    }
}

function startGame(): void {

    const config = {
        type: Phaser.AUTO,
        parent: 'canvas',
        width: window.innerWidth,
        height: window.innerHeight,
        scene: [
            //Preloader,
            // Main
        ]
    };

    const game = new SpaceGame(config);

    window.addEventListener('resize', function (event) {
        game.resize(window.innerWidth, window.innerHeight);
    }, false);
}
window.onload = () => {
    console.log('Starting game');
    startGame();
};
