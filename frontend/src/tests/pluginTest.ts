export class ClownGameObject extends Phaser.GameObjects.Image {

	constructor(scene, x, y) {
		super(scene, x, y, 'clown');

		this.setScale(4);
	}

}

export class ClownPlugin extends Phaser.Plugins.BasePlugin {

	constructor(pluginManager) {
		super(pluginManager);

		//  Register our new Game Object type
		pluginManager.registerGameObject('clown', this.createClown);
	}

	createClown(x, y) {
		//return this.displayList.add(new ClownGameObject(this.scene, x, y));
	}

}