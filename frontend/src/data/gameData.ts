import { Galaxy } from './galaxyModels';

export interface GameState {
	player: Player;
	galaxy: Galaxy;
}

export class Player {
	public factionId: number;
}