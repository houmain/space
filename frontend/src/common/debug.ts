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
			console.log(`[DEBUG] ${DebugInfo.time} ${text}`);
		}
	}

	public static info(text: string) {
		if (DebugInfo.level <= LogLevel.INFO) {
			console.log(`[INFO] ${DebugInfo.time} ${text}`);
		}
	}

	public static warn(text: string) {
		if (DebugInfo.level <= LogLevel.WARN) {
			console.warn(`[WARN] ${DebugInfo.time} ${text}`);
		}
	}

	public static error(text: string) {
		console.error(`[ERROR] ${DebugInfo.time} ${text}`);
	}

	private static get time(): string {
		return new Date().toLocaleTimeString('de-de');
	}
}