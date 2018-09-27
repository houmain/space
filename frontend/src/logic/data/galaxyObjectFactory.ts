import { Fighter, Squadron } from '../../data/galaxyModels';
import { Pool } from '../../common/collections';

export class GalaxyObjectFactory {

	private _fighterPool: Pool<Fighter> = new Pool(Fighter);
	private _squadronPool: Pool<Squadron> = new Pool(Squadron);

	public buildFighter(): Fighter {
		return this._fighterPool.get();
	}

	public releaseFighter(fighter: Fighter) {
		this._fighterPool.release(fighter);
	}

	public buildSquadron(): Squadron {
		return this._squadronPool.get();
	}

	public releaseSquadron(squadron: Squadron) {
		this._squadronPool.release(squadron);
	}
}