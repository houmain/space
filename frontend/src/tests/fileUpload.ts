function inputBtn() {
	var input = document.createElement('input');
	input.type = "file";
	input.id = "myCheck";
	setTimeout(function () {
		//		$(input).click();
		//this.click();
	}, 200);
	//without this next line, you'll get nuthin' on the display
	document.getElementById('canvas').appendChild(input);


	let elem = document.getElementById("myCheck");
	elem.addEventListener('change', handleFileSelect, false);

	elem.click();
}

function handleFileSelect(evt) {
	var files = evt.target.files; // FileList object

	// files is a FileList of File objects. List some properties.
	var output = [];
	for (var i = 0, f; f = files[i]; i++) {
		output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
			f.size, ' bytes, last modified: ',
			f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a',
			'</li>');

		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onload = (function (theFile) {
			return function (e) {
				// Render thumbnail.
				/*	var span = document.createElement('span');
					span.innerHTML = ['<img class="thumb" src="', e.target.result,
						'" title="', escape(theFile.name), '"/>'].join('');
					document.getElementById('list').insertBefore(span, null);
	*/
				var error = reader.error;
				var texte = reader.result;
				console.log(texte);

				var script = document.createElement('script');
				script.type = "text/javascript";
				script.onload = function () {
					//do stuff with the script
					alert(10);
				};
				script.text = texte as string;

				document.head.appendChild(script);

				//document.getElementById("DisplayText").innerText=reader.result; 
			};
		})(f);

		// Read in the image file as a data URL.
		reader.readAsText(f);

	}
	//	document.getElementById('list').innerHTML = '<ul>' + output.join('') + '</ul>';

	console.log('Test' + output.join(''));
}
