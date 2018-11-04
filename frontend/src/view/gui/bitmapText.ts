export class BitmapText extends Phaser.GameObjects.BitmapText {

	public setWordWrapWidth(wordWrapWidth: number) {
		let fragements: string[] = this.text.split(' ');
		this.text = '';

		for (let f = 0; f < fragements.length; f++) {
			this.text += fragements[f] + ' ';

			if (this.width > wordWrapWidth) {
				this.text = this.text.substr(0, this.text.length - fragements[f].length - 2);
				this.text += '\n';
				this.text += fragements[f] + ' ';
			}
		}
	}
}