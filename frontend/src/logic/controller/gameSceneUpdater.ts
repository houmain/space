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

	public init() {
		this.initializePositions(0, 0);
	}

	private initializePositions(timeSinceStart: number, timeSinceLastFrame: number) {
		let planets = this._planets.list;
		planets.forEach(planet => {
			let angle = planet.initialAngle + planet.angularVelocity * timeSinceStart;
			planet.setPosition(Math.cos(angle) * planet.distance, Math.sin(angle) * planet.distance);

			if (planet.parent) {
				planet.setPosition(planet.x + planet.parent.x, planet.y + planet.parent.y);
			}

			let squadrons = planet.squadrons.list;
			squadrons.forEach(squadron => {
				squadron.setPositon(planet.x, planet.y);

				squadron.fighters.forEach(fighter => {
					fighter.setPosition(planet.x, planet.y);
				});
			});
		});
	}

	public update(timeSinceStart: number, timeSinceLastFrame: number) {
		let planets = this._planets.list;
		planets.forEach(planet => {
			let angle = planet.initialAngle + planet.angularVelocity * timeSinceStart;
			planet.setPosition(Math.cos(angle) * planet.distance, Math.sin(angle) * planet.distance);

			if (planet.parent) {
				planet.setPosition(planet.x + planet.parent.x, planet.y + planet.parent.y);
			}

			let squadrons = planet.squadrons.list;
			squadrons.forEach(squadron => {
				squadron.setPositon(planet.x, planet.y);

				this.updateOrbitingFighters(squadron, timeSinceStart, timeSinceLastFrame);
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
				squadron.setPositon(squadron.x + dx * f, squadron.y + dy * f);
			}

			this.updateMovingFighters(squadron, timeSinceStart, timeSinceLastFrame);
		});
	}

	private updateOrbitingFighters(squadron: Squadron, timeSinceStart: number, timeSinceLastFrame: number) {
		let FIGHTER_VELOCITY = 30;
		let ORBITING_DISTANCE = 30;
		let ORBITING_SPEED = -0.2;

		squadron.fighters.forEach((fighter, index) => {
			let angle = 6.28 * index / squadron.fighters.length + timeSinceStart * ORBITING_SPEED;
			let targetX = squadron.x + Math.cos(angle) * ORBITING_DISTANCE;
			let targetY = squadron.y + Math.sin(angle) * ORBITING_DISTANCE;

			let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
			let speed = FIGHTER_VELOCITY * timeSinceLastFrame;
			let distance = range.length();
			if (distance > speed) {
				range = range.normalize().scale(speed);
			}

			fighter.setPosition(fighter.x + range.x, fighter.y + range.y);
		});
	}

	private updateMovingFighters(squadron: Squadron, timeSinceStart: number, timeSinceLastFrame: number) {
		let SQUADRON_AHEAD = 30;
		let FIGHTER_VELOCITY = squadron.speed * 1.15;

		let dirX = squadron.fightersX - squadron.x;
		let dirY = squadron.fightersY - squadron.y;
		let distance = Math.sqrt(dirX * dirX + dirY * dirY);
		if (distance > 0) {
			dirX /= distance;
			dirY /= distance;
			if (distance > SQUADRON_AHEAD) {
				squadron.fightersX = squadron.x + dirX * SQUADRON_AHEAD;
				squadron.fightersY = squadron.y + dirY * SQUADRON_AHEAD;
			}
		}
		let normalX = -dirY;
		let normalY = dirX;

		let sx = 5;
		let sy = 3;
		let row = 0;
		let rowSize = 0;
		let column = 0;
		squadron.fighters.forEach(fighter => {
			let targetX = squadron.fightersX;
			let targetY = squadron.fightersY;
			targetX += dirX * row * sx + normalX * (column - rowSize / 2) * sy;
			targetY += dirY * row * sx + normalY * (column - rowSize / 2) * sy;

			column++;
			if (column > rowSize) {
				column = 0;
				row++;
				if (rowSize < 7)
					rowSize += 3;
			}

			let range: Phaser.Math.Vector2 = new Phaser.Math.Vector2(targetX - fighter.x, targetY - fighter.y);
			let speed = FIGHTER_VELOCITY * timeSinceLastFrame;
			let distance = range.length();
			if (distance > speed) {
				range = range.normalize().scale(speed);
			}

			fighter.setPosition(fighter.x + range.x, fighter.y + range.y);
		});
	}
}
