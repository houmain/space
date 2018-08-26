import { Scenes } from './scenes';
import { SpaceGame } from '../Game';


declare let AIController: any;

export class AIMenuScene extends Phaser.Scene {

	public constructor() {
		super(Scenes.AI_MENU);
	}

	public create() {
		let background = this.add.tileSprite(0, 0, 2048, 2048, 'mainMenu');
		background.setTint(0x555555);

		this.createFileInput();
	}

	private createFileInput() {

		document.getElementById('div-text').style.visibility = 'visible';

		let input = document.createElement('input');
		input.type = "file";
		input.id = "fileUpload";
		input.addEventListener('change', this.loadScript, false);
		document.getElementById('div-text').appendChild(input);
	}

	private loadScript(evt) {
		try {
			let files = evt.target.files;

			let output = [];

			for (let i = 0, f; f = files[i]; i++) {
				output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
					f.size, ' bytes, last modified: ',
					f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
					'</li>');

				let reader = new FileReader();

				reader.onload = (function (theFile) {

					return function (e) {
						console.log(1);
						let error = reader.error;
						let texte = reader.result;

						console.log(texte);
						let script = document.createElement('script');
						script.type = "text/javascript";

						script.onload = function () {
							//console.log(theFile.defult_id);
						};

						script.text = texte as string;

						//  script.src = theFile;

						document.head.appendChild(script);

						//	console.log(test());// test.defult_id);


						let s = new AIController();
						s.startTest()
						//console.log();

						//document.getElementById("DisplayText").innerText=reader.result; 
					};
				})(f);
				reader.readAsText(f);
			}
		} catch (e) {
			alert(e);
		}

		console.log('Test' + output.join(''));
	}

	public shutdown() {
		// hide div again TODO:
	}
}