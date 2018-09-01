import { BotController } from './botInterfaces';
import { Planet, Faction } from '../../data/galaxyModels';

export class BotLoader {

	public loadBot(bot: any): BotController {
		console.log('loaded my bot');

		let planetMap: { [id: number]: Planet; } = {};
		let factionMap: { [id: number]: Faction; } = {};

		let data: { [id: string]: any; } = {};
		data['planets'] = planetMap;
		data['factions'] = factionMap;

		let actions: { [id: string]: Function; } = {};
		actions['test'] = (test: string) => {
			console.log('call me' + test);
		};

		let b = bot as BotController;
		console.log(b.info.name);
		b.init(data, actions);
		b.startTest();

		this.onLoaded(b);

		return b;
	}

	public onLoaded: Function;
}
