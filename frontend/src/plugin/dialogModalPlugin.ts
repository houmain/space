class ClownGameObject extends Phaser.GameObjects.Image {

	constructor(scene, x, y) {
		super(scene, x, y, 'clown');
		this.setScale(4);
	}
}

class ClownGameObject2 extends Phaser.GameObjects.Container {


}

export class DialogPlugin extends Phaser.Plugins.BasePlugin {

	constructor(pluginManager) {
		super(pluginManager);

		//  Register our new Game Object type
		pluginManager.registerGameObject('dialog', this.createDialog);
	}

	private createDialog(x: number, y: number) {

		let i = new ClownGameObject(this.scene, x, y);
		return this.scene.add.container(x, y, new ClownGameObject2(this.scene));
	}
}