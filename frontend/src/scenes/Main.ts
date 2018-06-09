export class Main extends Phaser.Scene {
    constructor() {
        super("main");
    }

    create() {

        const background = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'background');
      //  background.setOrigin()
        //background.setScale(15);

        const logo = this.add.sprite(this.sys.canvas.width / 2, this.sys.canvas.height / 2, 'sheet1', 'phaser-logo');
        
       // const music = this.sound.add('DOG');
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            /*if (!music.isPlaying) {
                music.play();
            }*/

            logo.setPosition(pointer.x, pointer.y);
        });
    }
}
