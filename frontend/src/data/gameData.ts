import { Galaxy, Faction } from './galaxyModels';

export interface GameState {
	player: Player;
	galaxy: Galaxy;
}

export class Player {
	public faction: Faction;
}