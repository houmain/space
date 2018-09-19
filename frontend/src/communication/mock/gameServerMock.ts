import { MessageGameJoined, ServerMessageType, MessageFighterCreated, ClientMessage, ClientMessageType } from '../communicationInterfaces';
import { GalaxyDataHandler } from '../../logic/galaxyDataHandler';
import { CommunicationHandlerMock } from './communicationHandlerMock';

const UPDATE_INTERVALL = 3000;

export class GameServerMock {

	private _communicationHandler: CommunicationHandlerMock;
	private _galaxyDataHandler: GalaxyDataHandler;

	public constructor(communicationHandler: CommunicationHandlerMock, galaxyDataHandler: GalaxyDataHandler) {
		this._communicationHandler = communicationHandler;
		this._galaxyDataHandler = galaxyDataHandler;
	}

	public receive(clientMessage: ClientMessage) {
		switch (clientMessage.action) {
			case ClientMessageType.JOIN_GAME:
				this._communicationHandler.receive(this.createMessageGameJoined());
				setTimeout(() => {
					this.update();
				}, 1000);
				break;
			case ClientMessageType.SEND_SQUADRON:
				break;
		}
	}

	private createMessageGameJoined(): MessageGameJoined {

		let jsonMsgJoined = '{"event":"gameJoined",' +
			'"factions":[{"id":1,"name":"Faction #1"},{"id":2,"name":"Faction #2"},{"id":3,"name":"Faction #3"},{"id":4,"name":"Faction #4"}],' +
			'"planets":[{"id":1,"name":"","initialAngle":0,"angularVelocity":0,"distance":0,"maxUpkeep":0,"productionRate":0,"productionProgress":0,"defenseBonus":0},{"id":2,"name":"","initialAngle":0,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":1,"maxUpkeep":30,"productionRate":0.4,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":1,"fighterCount":5,"factionId":1}]},{"id":3,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":2,"fighterCount":3}]},{"id":4,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":3,"fighterCount":3}]},{"id":5,"name":"","initialAngle":1.256,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":2,"maxUpkeep":40,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":4,"fighterCount":5,"factionId":2}]},{"id":6,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":5,"fighterCount":3}]},{"id":7,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":6,"fighterCount":3}]},{"id":8,"name":"","initialAngle":2.512,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":3,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":10,"squadrons":[{"squadronId":7,"fighterCount":5,"factionId":3}]},{"id":9,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":8,"fighterCount":3}]},{"id":10,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":9,"fighterCount":3}]},{"id":11,"name":"","initialAngle":3.768,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":4,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":10,"fighterCount":5,"factionId":4}]},{"id":12,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":11,"fighterCount":3}]},{"id":13,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,' +
			'"squadrons":[{"squadronId":12,"fighterCount":3}]}],"squadrons":[],"factionId":1}';
		return JSON.parse(jsonMsgJoined);
	}

	private createMessageFighterCreated(): MessageFighterCreated {

		let planet = this._galaxyDataHandler.planets[2];

		return {
			event: ServerMessageType.FIGHTER_CREATED,
			fighterCount: 1,
			planetId: planet.id,
			squadronId: planet.squadrons[0].id
		};
	}

	private update() {
		this.doNextAction();

		setTimeout(() => {
			this.update();
		}, UPDATE_INTERVALL);
	}

	private doNextAction() {
		this._communicationHandler.receive(this.createMessageFighterCreated());
	}
}