
declare let Bot: any;

export class BotScriptLoader {

	private _scriptFile = null;

	public loadScript(evt, onLoaded: Function) {

		try {
			let files = evt.target.files;

			for (let i = 0, f; f = files[i]; i++) {

				this._scriptFile = f;

				this.loadBotScript(f, onLoaded);
			}
		} catch (e) {
			alert(e);
		}
	}

	private loadBotScript(file: any, onLoaded: Function) {

		let reader = new FileReader();

		reader.onload = (function (theFile) {

			return function (e) {

				let error = reader.error;

				let script = document.createElement('script');
				script.type = 'text/javascript';
				script.onload = function () {
					//console.log(theFile.defult_id);
				};
				script.text = reader.result as string;
				script.id = 'AIScript';

				document.head.appendChild(script);

				let bot = new Bot();

				onLoaded(bot);
			};
		})(file);
		reader.readAsText(file);
	}

	public reloadScript() {

		try {
			console.log('reload' + this._scriptFile.name);
			Bot = null;
			let aiScript = document.getElementById('AIScript');
			if (aiScript) {
				console.log('aiScript found');
				document.head.removeChild(aiScript);
			} else {
				console.log('aiScript not found');
			}

			this.loadBotScript(this._scriptFile, null);
			console.log('reloaded');
		} catch (e) {
			alert(e);
		}
	}
}