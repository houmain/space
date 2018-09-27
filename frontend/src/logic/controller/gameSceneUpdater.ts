import { Map } from '../../common/collections';
import { Planet, Squadron, Fighter } from '../../data/galaxyModels';
import { GalaxyDataHandler } from '../data/galaxyDataHandler';

export class GameSceneUpdater {

	private _planets: Map<Planet>;
	private _squadrons: Map<Squadron>;

	public constructor(galaxyDataHandler: GalaxyDataHandler) {
		this._planets = galaxyDataHandler.planets;
		this._squadrons = galaxyDataHandler.squadrons;
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		let FIGHTER_VELOCITY = 0.1;
		let speed = FIGHTER_VELOCITY * timeSinceLastFrame;

		let planets = this._planets.list;
		planets.forEach(planet => {
			let angle = planet.initialAngle + planet.angularVelocity * timeSinceStart;
			planet.x = Math.cos(angle) * planet.distance;
			planet.y = Math.sin(angle) * planet.distance;
			if (planet.parent) {
				planet.x += planet.parent.x;
				planet.y += planet.parent.y;
			}

			planet.sprite.x = planet.x;
			planet.sprite.y = planet.y;
		});

		let squadrons = this._squadrons.list;
		squadrons.forEach(squadron => {

			let planet = squadron.planet;
			let targetX = planet.x;
			let targetY = planet.y;

			let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - squadron.x, targetY - squadron.y);

			range = range.normalize().scale(speed);

			squadron.x += range.x;
			squadron.y += range.y;

			squadron.sprite.x = squadron.x;
			squadron.sprite.y = squadron.y;

			squadron.fighters.forEach(fighter => {
				this.updateFighter(fighter, timeSinceLastFrame);
			});
		});
	}

	private updateFighter(fighter: Fighter, delta: number) {

		let ANGULAR_VELOCITY = 0.0025;
		let FIGHTER_VELOCITY = 0.1;

		fighter.orbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * delta;

		let targetX = fighter.squadron.x;
		let targetY = fighter.squadron.y;
		targetX += Math.cos(fighter.orbitingAngle) * fighter.orbitingDistance;
		targetY += Math.sin(fighter.orbitingAngle) * fighter.orbitingDistance;

		let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
		let speed = FIGHTER_VELOCITY * delta + (1 + Math.cos(fighter.orbitingAngle * 3)) / 8;

		if (range.length() > speed) {
			range = range.normalize().scale(speed);
		}

		fighter.setPositon(fighter.x + range.x, fighter.y + range.y);

		let newOrbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * delta * 5;
		targetX = fighter.squadron.x + Math.cos(newOrbitingAngle) * fighter.orbitingDistance;
		targetY = fighter.squadron.y + Math.sin(newOrbitingAngle) * fighter.orbitingDistance;

		range = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
	}
}