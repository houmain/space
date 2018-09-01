function Bot() {
	this.info = {
		name: 'Furious Dan',
		author: 'Jon de Kerloor',
		version: '0.1'
	}
}

Bot.prototype.init = function (data, actions) {
	this.planets = data['planets'];
	this.callTest = actions['test'];
};

Bot.prototype.startTest = function () {
	console.log('start yuhu4');
	this.callTest('hallo');
};