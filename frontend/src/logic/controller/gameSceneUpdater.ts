import { Map } from '../../common/collections';
import { Planet, Squadron, Fighter } from '../../data/galaxyModels';
import { GalaxyDataHandler } from '../data/galaxyDataHandler';

export class GameSceneUpdater {

	private _planets: Map<Planet>;
	private _movingSquadrons: Map<Squadron>;

	public constructor(galaxyDataHandler: GalaxyDataHandler) {
		this._planets = galaxyDataHandler.planets;
		this._movingSquadrons = galaxyDataHandler.movingSquadrons;
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {

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

			planet.squadrons.forEach(squadron => {
				squadron.x = planet.x;
				squadron.y = planet.y;

				squadron.sprite.x = planet.x;
				squadron.sprite.y = planet.y;

				squadron.fighters.forEach(fighter => {
					this.updateFighter(fighter, timeSinceLastFrame);
				});
			});
		});

		let squadrons = this._movingSquadrons.list;
		squadrons.forEach(squadron => {
			const dx: number = squadron.planet.x - squadron.x;
			const dy: number = squadron.planet.y - squadron.y;
			const distance: number = Math.sqrt(dx * dx + dy * dy);

			const distanceCovered: number = timeSinceLastFrame * squadron.speed;

			if (distanceCovered < distance) {
				const f: number = distanceCovered / distance;
				squadron.x += dx * f;
				squadron.y += dy * f;
			}

			squadron.fighters.forEach(fighter => {
				this.updateFighter(fighter, timeSinceLastFrame);
			});
		});
	}

	private updateFighter(fighter: Fighter, timeSinceLastFrame: number) {

		let ANGULAR_VELOCITY = 0.0025;
		let FIGHTER_VELOCITY = 0.1;

		fighter.orbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * timeSinceLastFrame;

		let targetX = fighter.squadron.x;
		let targetY = fighter.squadron.y;
		targetX += Math.cos(fighter.orbitingAngle) * fighter.orbitingDistance;
		targetY += Math.sin(fighter.orbitingAngle) * fighter.orbitingDistance;

		let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
		let speed = FIGHTER_VELOCITY * timeSinceLastFrame + (1 + Math.cos(fighter.orbitingAngle * 3)) / 8;

		if (range.length() > speed) {
			range = range.normalize().scale(speed);
		}

		fighter.setPositon(fighter.x + range.x, fighter.y + range.y);

		let newOrbitingAngle = fighter.orbitingAngle + ANGULAR_VELOCITY * timeSinceLastFrame * 5;
		targetX = fighter.squadron.x + Math.cos(newOrbitingAngle) * fighter.orbitingDistance;
		targetY = fighter.squadron.y + Math.sin(newOrbitingAngle) * fighter.orbitingDistance;

		range = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
	}
}