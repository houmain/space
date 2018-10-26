import { GalaxyDataHandler } from '../logic/data/galaxyDataHandler';
import { Squadron } from '../data/galaxyModels';

export let DEBUG = false;

export class Assert {

	public static ok(condition: boolean, message: string) {
		if (DEBUG && !condition) {
			Assert.throwError(message);
		}
	}

	public static isNotNull(object: any, message: string) {
		if (DEBUG && object === null) {
			Assert.throwError(message);
		}
	}

	public static equals(value1: any, value2: any, message: string) {
		if (DEBUG && value1 !== value2) {
			Assert.throwError(message);
		}
	}

	private static throwError(message: string) {
		console.error(message);

		message = message || 'Assertion failed';
		if (typeof Error !== 'undefined') {
			throw new Error(message);
		}
		throw message;
	}
}

class LogLevel {
	static DEBUG = 0;
	static INFO = 1;
	static WARN = 2;
	static ERROR = 3;
}

export class DebugInfo {

	public static level = LogLevel.INFO;

	public static debug(text: string) {
		if (DebugInfo.level <= LogLevel.DEBUG) {
			console.log(`[DEBUG] ${text}`);
		}
	}

	public static info(text: string) {
		if (DebugInfo.level <= LogLevel.INFO) {
			console.log(`[INFO] ${text}`);
		}
	}

	public static warn(text: string) {
		if (DebugInfo.level <= LogLevel.WARN) {
			console.warn(`[WARN] ${text}`);
		}
	}

	public static error(text: string) {
		console.error(`[ERROR] ${text}`);
	}
}

export class ErrorChecker {

	public static checkAllFightersHaveSprites(galaxyDataHandler: GalaxyDataHandler) {
		let squadrons: Squadron[] = galaxyDataHandler.allSquadrons.list;
		squadrons.forEach(squadron => {
			let fighters = squadron.fighters;
			fighters.forEach(fighter => {
				Assert.isNotNull(fighter.sprite, 'Fighter sprite must not be null.');
			});
		});

		DebugInfo.info('checkAllFightersHaveSprites OK');
	}

	public static checkAllSquadronsHaveSprites(galaxyDataHandler: GalaxyDataHandler) {
		let squadrons: Squadron[] = galaxyDataHandler.allSquadrons.list;
		squadrons.forEach(squadron => {
			Assert.isNotNull(squadron.sprite, 'Squadron sprite must not be null.');
		});

		DebugInfo.info('checkAllSquadronsHaveSprites OK');
	}
}

export class JSON2 {

	private static seen = [];
	public static stringify(value: any) {
		JSON.stringify(value, function (key, val) {
			if (val !== null && typeof val === 'object') {
				if (JSON2.seen.indexOf(val) >= 0) {
					return;
				}
				JSON2.seen.push(val);
			}
			return val;
		});
	}

}