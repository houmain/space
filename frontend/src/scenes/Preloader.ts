import { config } from '../config/preload';

export class Preloader extends Phaser.Scene {

    private _socket:any;

    constructor() {
        super({
            key: 'preloader',
            pack: {
                files: [
                    { type: 'image', key: 'bar', url: './assets/images/loadBar.png' },
                    { type: 'image', key: 'barBg', url: './assets/images/barBg.png' }
                ]
            }
        });
    }

    public preload() {
        // add the loading bar to use as a display for the loading progress of the remainder of the assets
        const barBg = this.add.image(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'barBg');
        const bar = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'bar');

        const mask = this.make.graphics({
            x: bar.x - (bar.width / 2),
            y: bar.y - (bar.height / 2),
            add: false
        });
        mask.fillRect(0, 0, 0, bar.height);

        bar.mask = new Phaser.Display.Masks.GeometryMask(this, mask);
        
        this.load.on('progress', (progress: number) => {
            mask.clear();
            mask.fillRect(0, 0, bar.width * progress, bar.height);
        });

        // load assets declared in the preload config
        this.loadAtlas();
        this.loadAudio();
        this.loadTextures();

        //let url = window.location.origin.replace(/https?/g, "ws");
        let url = "ws://127.0.0.1:9995/";
        this._socket = new WebSocket(url, "websocket");
        
        this._socket.onopen = ()=> {
            console.log("connected");

            this._socket.send('{ "action": "joinGame", "gameId": 0 }');
            this._socket.send('{ "something": 10 }');
            this._socket.send('{ "action": "sendSquadron", sourcePlanetId: 1, targetPlanetId: 2, shipIds: [1,2,3,4] }');
        };
        this._socket.onclose = function() {
            console.log("disonnected");
        };
        this._socket.onmessage = function(event:any) {
            console.log(event.data);
        };
        Object.seal(this._socket);
    }
    
    public create() {
        this.scene.start('main');
    }

    private loadAtlas() {
        const sheetPath = config.ssPath;
        const sheets = config.sheets;

        this.load.setPath(sheetPath);

        for (let i = 0; i < sheets.length; i++) {
            this.load.atlas(sheets[i], `${sheets[i]}.png`, `${sheets[i]}.json`);
        }
    }

    private loadTextures(){
        let loader = this.load.image('background','../images/background.png');        
    } 

    private loadAudio() {
        /*const audioPath = config.audioPath;
        const audioFiles = config.audioFiles;

        this.load.setPath(audioPath);

        for (let i = 0; i < audioFiles.length; i++) {
            this.load.audio(audioFiles[i].key, audioFiles[i].mp3, audioFiles[i].ogg);
        }*/
    }

    private initConnection(){

    }
}