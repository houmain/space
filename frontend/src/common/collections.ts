export class Pool<T> {
	private _pool: T[];
	private _resetter: Resettable<T>;

	constructor(resetFunction: Resettable<T>) {
		this._pool = [];
		this._resetter = resetFunction;
	}

	public get(): T {
		if (this._pool.length) {
			return this._pool.splice(0, 1)[0];
		}
		return new this._resetter();
	}

	public release(obj: T): void {
		if (this._resetter.reset) {
			this._resetter.reset(obj);
		}
		this._pool.push(obj);
	}
}

export interface Resettable<T extends Object> {
	// constructor
	new(): T;

	// static
	reset?(obj: T): void;
}

export class Map<T> {

	private _valuesMap: { [key: string]: T; } = {};
	private _values: T[] = [];
	private _dirty: boolean = true;

	public add(key: number | string, value: T) {
		this._valuesMap[key] = value;
		this._dirty = true;
	}

	public delete(key: number | string) {
		delete this._valuesMap[key];
		this._dirty = true;
	}

	public get(key: number | string): T {
		return this._valuesMap[key];
	}

	public get list(): T[] {
		if (this._dirty) {
			this.rebuildList();
			this._dirty = false;
		}

		return this._values;
	}

	private rebuildList() {
		this._values.splice(0);

		for (let key in this._valuesMap) {
			this._values.push(this._valuesMap[key]);
		}
	}
}