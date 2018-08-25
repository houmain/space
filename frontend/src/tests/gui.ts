import { GuiFactory } from "../view/gui/guiFactory";

let container = this.add.container(200, 200);

let windowColor = 0x303030;
let borderColor = 0x3ca6ff;//0xffffff;//907748;
let borderAlpha = 1;
let borderThickness = 3;
let windowAlpha = 0.8;

let rectWidth = 300;
let rectHeight = 100;

let graphics = this.add.graphics();
graphics.fillStyle(windowColor, windowAlpha);
graphics.fillRect(1, 1, rectWidth - 1, rectHeight - 1);

graphics.lineStyle(borderThickness, borderColor, borderAlpha);
graphics.strokeRect(0, 0, rectWidth, rectHeight);

let text = this.add.text(10, 10, 'With the basic functionality of the window in place, we will now work on adding the actual dialog',
	{
		wordWrap: { width: rectWidth - 10 }
	});


let button = this.add.text(200, 50, 'OK', {
	font: 'bold 24px Verdana',
	color: '#00ff00',
	backgroundColor: '#ff00ff'
});
button.setInteractive();
button.on('pointerover', function () {
	button.setBackgroundColor('#ff0000');
	console.log('test3');
});
button.on('pointerout', function () {
	//button.clearTint();
	console.log('test2');
	button.setBackgroundColor('#ff00ff');
});
button.on('pointerdown', function () {
	//self.toggleWindow();
	console.log('test');
});

container.add(graphics);
container.add(text);
container.add(button);

let factory = new GuiFactory(this);
factory.buildTextButton(
	'START',
	{
		x: 400,
		y: 400,
		width: 100,
		height: 50
	}, {
		color: 0xffff00,
		alpha: 0.9,
		borderColor: 0x0000ff,
		borderAlpha: 1,
		borderThickness: 4
	}
)