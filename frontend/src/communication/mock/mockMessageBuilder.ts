import { MessageGameJoined, MessagePlayerJoined, ServerMessageType, SendSquadron, MessageSquadronSent, MessageSquadronAttacks, MessageSquadronDestroyed, MessageFighterDestroyed, MessagePlanetConquered, MessageFighterCreated, MessageSquadronsMerged, MessageGameCreated, JoinGameMessage, PlayerReadyMessage, MessagePlayerReady } from '../communicationInterfaces';
import { DebugInfo } from '../../common/debug';

export class MockMessageBuilder {

	public static createMessageGameCreated(gameId: number): MessageGameCreated {
		DebugInfo.info('[MOCK] Created MessageGameCreated');
		return {
			event: ServerMessageType.GAME_CREATED,
			gameId: gameId
		};
	}

	public static createMessagePlayerJoined(factionId: number, msg: JoinGameMessage): MessagePlayerJoined {
		DebugInfo.info('[MOCK] Created MessagePlayerJoined');
		return {
			event: ServerMessageType.PLAYER_JOINED,
			gameId: msg.gameId,
			factionId: factionId,
			avatar: msg.avatar,
			color: msg.color,
			faction: msg.faction,
			name: msg.name
		};
	}

	public static createMessagePlayerReady(msg: PlayerReadyMessage): MessagePlayerReady {
		DebugInfo.info('[MOCK] Created MessagePlayerReady');
		return {
			event: ServerMessageType.PLAYER_READY,
			playerId: msg.playerId
		};
	}

	public static createMessageGameJoined(): MessageGameJoined {
		let joinMsg: string;
		let addFighters = true;

		if (addFighters) {
			let numPlayerFighters = 25;
			joinMsg = '{"event":"gameJoined",' +
				'"factions":[{"id":1,"name":"Player Faction"},{"id":2,"name":"Faction #2"},{"id":3,"name":"Faction #3"},{"id":4,"name":"Faction #4"}],' +
				'"planets":[{"id":1,"name":"","initialAngle":0,"angularVelocity":0,"distance":0,"maxUpkeep":0,"productionRate":0,"productionProgress":0,"defenseBonus":0},{"id":2,"name":"","initialAngle":0,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":1,"maxUpkeep":100,"productionRate":0.4,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":1,"fighterCount":' + numPlayerFighters + ',"factionId":1}]},{"id":3,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":2,"fighterCount":3}]},{"id":4,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":3,"fighterCount":3}]},{"id":5,"name":"","initialAngle":1.256,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":2,"maxUpkeep":40,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":4,"fighterCount":5,"factionId":2}]},{"id":6,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":5,"fighterCount":3}]},{"id":7,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":6,"fighterCount":3}]},{"id":8,"name":"","initialAngle":2.512,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":3,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":10,"squadrons":[{"squadronId":7,"fighterCount":5,"factionId":3}]},{"id":9,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":8,"fighterCount":3}]},{"id":10,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":9,"fighterCount":3}]},{"id":11,"name":"","initialAngle":3.768,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":4,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":10,"fighterCount":5,"factionId":4}]},{"id":12,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":11,"fighterCount":3}]},{"id":13,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,' +
				'"squadrons":[{"squadronId":12,"fighterCount":3}]}],"squadrons":[],"factionId":1}';
		} else {
			joinMsg = '{"event":"gameJoined",' +
				'"factions":[{"id":1,"name":"Faction #1"},{"id":2,"name":"Faction #2"},{"id":3,"name":"Faction #3"},{"id":4,"name":"Faction #4"}],' +
				'"planets":[{"id":1,"name":"","initialAngle":0,"angularVelocity":0,"distance":0,"maxUpkeep":0,"productionRate":0,"productionProgress":0,"defenseBonus":0},{"id":2,"name":"","initialAngle":0,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":1,"maxUpkeep":30,"productionRate":0.4,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":1,"fighterCount":0,"factionId":1}]},{"id":3,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":2,"fighterCount":0}]},{"id":4,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":2,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":3,"fighterCount":0}]},{"id":5,"name":"","initialAngle":1.256,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":2,"maxUpkeep":40,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":4,"fighterCount":0,"factionId":2}]},{"id":6,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":5,"fighterCount":0}]},{"id":7,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":5,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":6,"fighterCount":0}]},{"id":8,"name":"","initialAngle":2.512,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":3,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":10,"squadrons":[{"squadronId":7,"fighterCount":0,"factionId":3}]},{"id":9,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":8,"fighterCount":0}]},{"id":10,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":8,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":9,"fighterCount":0}]},{"id":11,"name":"","initialAngle":3.768,"angularVelocity":0.12560000000000002,"distance":200,"parent":1,"faction":4,"maxUpkeep":30,"productionRate":0.2,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":10,"fighterCount":0,"factionId":4}]},{"id":12,"name":"","initialAngle":0,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,"squadrons":[{"squadronId":11,"fighterCount":0}]},{"id":13,"name":"","initialAngle":2.0933333333333333,"angularVelocity":0.4186666666666667,"distance":60,"parent":11,"maxUpkeep":15,"productionRate":0.1,"productionProgress":0,"defenseBonus":0,' +
				'"squadrons":[{"squadronId":12,"fighterCount":0}]}],"squadrons":[],"factionId":1}';
		}

		return JSON.parse(joinMsg);
	}

	public static createMessageSquadronSent(clientMessage: SendSquadron, factionId: number, sourceSquadronId: number, newSquadronId: number): MessageSquadronSent {
		DebugInfo.info('[MOCK] Created SendSquadron');
		return {
			event: ServerMessageType.SQUADRON_SENT,
			sourcePlanetId: clientMessage.sourcePlanetId,
			targetPlanetId: clientMessage.targetPlanetId,
			fighterCount: clientMessage.fighterCount,
			factionId: factionId,
			sourceSquadronId: sourceSquadronId,
			speed: 50,
			squadronId: newSquadronId
		};
	}

	public static createMessageSquadronAttacks(targetPlanetId: number, squadronId: number): MessageSquadronAttacks {
		DebugInfo.info('[MOCK] Created SquadronAttacks');
		return {
			event: ServerMessageType.SQUADRON_ATTACKS,
			planetId: targetPlanetId,
			squadronId: squadronId
		};
	}


	public static createMessageSquadronsMerged(planetId: number, squadronId: number, intoSquadronId: number, fighterCount: number): MessageSquadronsMerged {
		DebugInfo.info('[MOCK] Created SquadronsMerged');
		return {
			event: ServerMessageType.SQUADRONS_MERGED,
			planetId: planetId,
			squadronId: squadronId,
			intoSquadronId: intoSquadronId,
			fighterCount: fighterCount,
		};
	}

	public static createMessageFighterDestroyed(planetId: number, squadronId: number, bySquadronId: number): MessageFighterDestroyed {
		DebugInfo.info('[MOCK] Created MessageFighterDestroyed');
		return {
			event: ServerMessageType.FIGHTER_DESTROYED,
			planetId: planetId,
			squadronId: squadronId,
			bySquadronId: bySquadronId,
			fighterCount: 1
		};
	}

	public static createMessageSquadronDestroyed(planetId: number, squadronId: number): MessageSquadronDestroyed {
		DebugInfo.info('[MOCK] Created SquadronDestroyed');
		return {
			event: ServerMessageType.SQUADRON_DESTROYED,
			planetId: planetId,
			squadronId: squadronId
		};
	}

	public static createMessagePlanetConquered(planetId: number, factionId: number, fromFactionId?: number): MessagePlanetConquered {
		DebugInfo.info('[MOCK] Created MessagePlanetConquered');
		return {
			event: ServerMessageType.PLANET_CONQUERED,
			planetId: planetId,
			factionId: factionId,
			fromFactionId: fromFactionId,
		};
	}

	public static createMessageFighterCreated(): MessageFighterCreated {

		return {
			event: ServerMessageType.FIGHTER_CREATED,
			fighterCount: 1,
			planetId: 1,
			squadronId: 1
		};
	}

}