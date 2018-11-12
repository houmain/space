import { GalaxyDataHandler } from '../data/galaxyDataHandler';
import { ObservableServerMessageHandler } from '../../communication/messageHandler';
import { MessageGameJoined, ServerMessageType, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed, MessagePlayerJoined, MessageFactionDestroyed } from '../../communication/communicationInterfaces';
import { Player } from '../../data/gameData';
import { Fighter, Squadron, Faction, Planet } from '../../data/galaxyModels';
import { Assert, DebugInfo } from '../../common/debug';
import { GameEventNotifier, GameEvent, EventPlayerJoined, GameEventType, EventFighterCreated, EventSquadronCreated, EventSquadronDestroyed, EventFighterDestroyed, EventPlanetConquered, EventFactionDestroyed, EventSquadronAttacksPlanet } from '../event/eventInterfaces';
import { GalaxyObjectFactory } from '../data/galaxyObjectFactory';
import { GalaxyFactory } from '../data/galaxyFactory';
import { JSONDebugger } from '../../common/utils';
import { PlanetUtils } from '../utils/utils';

export class GameLogicController {

	private _galaxyDataHandler: GalaxyDataHandler;
	private _player: Player;

	private _gameEventNotifier: GameEventNotifier;

	private _galaxyObjectfactory: GalaxyObjectFactory;

	public constructor(player: Player, serverMessageObserver: ObservableServerMessageHandler, galaxyDataHandler: GalaxyDataHandler, gameEventNotifier: GameEventNotifier) {
		this._player = player;

		this._galaxyDataHandler = galaxyDataHandler;
		this._gameEventNotifier = gameEventNotifier;

		this._galaxyObjectfactory = new GalaxyObjectFactory();

		serverMessageObserver.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined.bind(this));
		serverMessageObserver.subscribe<MessageGameJoined>(ServerMessageType.PLAYER_JOINED, this.onPlayerJoined.bind(this));
		serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		serverMessageObserver.subscribe<MessageSquadronSent>(ServerMessageType.SQUADRON_SENT, this.onSquadronSent.bind(this));
		serverMessageObserver.subscribe<MessageSquadronsMerged>(ServerMessageType.SQUADRONS_MERGED, this.onSquadronsMerged.bind(this));
		serverMessageObserver.subscribe<MessageSquadronAttacks>(ServerMessageType.SQUADRON_ATTACKS, this.onSquadronAttacksPlanet.bind(this));
		serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));
		serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
		serverMessageObserver.subscribe<MessageSquadronDestroyed>(ServerMessageType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));
		serverMessageObserver.subscribe<MessageFactionDestroyed>(ServerMessageType.FACTION_DESTROYED, this.onFactionDestroyed.bind(this));
	}

	private notify<T extends GameEvent>(eventId: string, event: T) {
		this._gameEventNotifier.notify(eventId, event);
	}

	private onGameJoined(msg: MessageGameJoined) {
		let galaxy = GalaxyFactory.create(this._galaxyObjectfactory, msg.factions, msg.planets, msg.squadrons);
		this._galaxyDataHandler.init(galaxy);
		this._player.faction = this._galaxyDataHandler.factions.get(msg.factionId);
	}

	private onPlayerJoined(msg: MessagePlayerJoined) {

		let faction = this._galaxyDataHandler.factions.get(msg.factionId);

		this.notify<EventPlayerJoined>(GameEventType.PLAYER_JOINED, {
			type: GameEventType.PLAYER_JOINED,
			faction: faction,
			planet: faction.planets[0]
		} as EventPlayerJoined);
	}

	private onFighterCreated(msg: MessageFighterCreated) {
		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		let squadron = planet.squadrons.get(msg.squadronId);

		if (squadron) {
			let fighter = this._galaxyObjectfactory.buildFighter();
			fighter.setPosition(squadron.planet.x, squadron.planet.y);
			fighter.orbitingAngle = 0;
			fighter.squadron = squadron;
			fighter.orbitingDistance = Fighter.FIGHTER_ORBITING_DISTANCE_PLANET;
			squadron.fighters.push(fighter);

			if (squadron.faction) {
				squadron.faction.numFighters++;
			}

			let event = {
				type: GameEventType.FIGHTER_CREATED,
				fighter: fighter
			};

			this.notify<EventFighterCreated>(GameEventType.FIGHTER_CREATED, event);
		} else {
			DebugInfo.error('Unknown squadron with id ' + msg.squadronId);
		}

		Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::createFighter: squadron ${msg.squadronId}
		Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
	}

	private onSquadronSent(msg: MessageSquadronSent) {
		let planet = this._galaxyDataHandler.planets.get(msg.sourcePlanetId);
		let sentSquadron: Squadron = planet.squadrons.get(msg.squadronId);

		if (sentSquadron) {
			planet.squadrons.delete(sentSquadron.id);
			DebugInfo.info(`Removed squadron ${sentSquadron.id} from planet ${planet.name}`);
		} else {
			let faction = this._galaxyDataHandler.factions.get(msg.factionId);
			let targetPlanet = this._galaxyDataHandler.planets.get(msg.targetPlanetId);
			let sourcePlanet = this._galaxyDataHandler.planets.get(msg.sourcePlanetId);

			sentSquadron = this.createSquadron(msg.squadronId, faction, sourcePlanet.x, sourcePlanet.y, targetPlanet);
			DebugInfo.info(`Created a new squadron with id ${sentSquadron.id}`);
		}
		sentSquadron.speed = msg.speed;

		this._galaxyDataHandler.movingSquadrons.add(sentSquadron.id, sentSquadron);
		DebugInfo.info(`Added squadron ${sentSquadron.id} to moving squadrons`);

		let sourceSquadron = planet.squadrons.get(msg.sourceSquadronId);
		Assert.isNotNull(sourceSquadron, 'Squadron must not null');

		let sentFighters: Fighter[] = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - msg.fighterCount, msg.fighterCount);

		sentFighters.forEach(figher => {
			figher.squadron = sentSquadron;
			figher.orbitingDistance = Fighter.FIGHTER_ORBITING_DISTANCE_MOVING;
		});
		sentSquadron.fighters.push(...sentFighters);

		DebugInfo.info(`Sending squadron. Now ${this._galaxyDataHandler.movingSquadrons.length} moving squadrons.`);
	}

	private createSquadron(squadronId: number, faction: Faction, x: number, y: number, targetPlanet: Planet) {
		let squadron = this._galaxyObjectfactory.buildSquadron();

		squadron.id = squadronId;
		squadron.faction = faction;
		squadron.planet = targetPlanet;
		squadron.setPositon(x, y);

		DebugInfo.info(JSONDebugger.stringify(squadron));

		this._gameEventNotifier.notify<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, {
			type: GameEventType.SQUADRON_CREATED,
			squadron: squadron
		});

		return squadron;
	}

	private onSquadronsMerged(msg: MessageSquadronsMerged) {

		let sourceSquadron = this._galaxyDataHandler.movingSquadrons.get(msg.squadronId);
		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		let targetSquadron = planet.squadrons.get(msg.intoSquadronId);

		this.handOverFighters(sourceSquadron, targetSquadron);

		Assert.equals(targetSquadron.fighters.length, msg.fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${msg.fighterCount}`);
		this._galaxyDataHandler.movingSquadrons.delete(sourceSquadron.id);
		DebugInfo.info(`Removed squadron ${sourceSquadron.id} from moving squadrons.`);

		this.deleteSquadron(sourceSquadron);

		DebugInfo.info(`Squadrons merged. Now ${this._galaxyDataHandler.movingSquadrons.length} moving squadrons.`);
	}

	private deleteSquadron(squadron: Squadron, planet?: Planet) {

		this._gameEventNotifier.notify<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, {
			type: GameEventType.SQUADRON_DESTROYED,
			squadron: squadron,
			planet: planet
		});

		this._galaxyObjectfactory.releaseSquadron(squadron);
	}

	private onSquadronAttacksPlanet(msg: MessageSquadronAttacks) {
		let sentSquadron: Squadron = this._galaxyDataHandler.movingSquadrons.get(msg.squadronId);
		this._galaxyDataHandler.movingSquadrons.delete(msg.squadronId);

		if (!sentSquadron) {
			DebugInfo.error(`No squadron found with id ${msg.squadronId} in moving squadrons!`);
		}

		sentSquadron.fighters.forEach(fighter => {
			fighter.orbitingDistance = Fighter.FIGHTER_ORBITING_DISTANCE_PLANET;
		});

		let planet = this._galaxyDataHandler.planets.get(msg.planetId);

		let quastl = PlanetUtils.getSquadronByFactionId(planet, sentSquadron.faction.id);
		if (quastl) {
			this.handOverFighters(sentSquadron, quastl);
			// todo kommt das noch eine destroyed nachricht?
		} else {
			planet.squadrons.add(sentSquadron.id, sentSquadron);
		}

		DebugInfo.info(`Removed squadron ${sentSquadron.id} from moving squadrons, now ${this._galaxyDataHandler.movingSquadrons.length} moving squadrons.`);
		DebugInfo.info(`Squadron ${sentSquadron.id} attacks planet ${planet.name}.`);
		DebugInfo.info(`Added squadron ${sentSquadron.id} to planet ${planet.name}, now ${planet.squadrons.length} squadrons on planet.`);

		this._gameEventNotifier.notify<EventSquadronAttacksPlanet>(GameEventType.SQUADRON_ATTACKS_PLANET, {
			type: GameEventType.SQUADRON_ATTACKS_PLANET,
			squadron: sentSquadron,
			planet: planet
		});
	}

	private handOverFighters(sourceSquadron: Squadron, targetSquadron: Squadron) {
		let fighters: Fighter[] = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
		fighters.forEach(fighter => {
			fighter.squadron = targetSquadron;
			fighter.orbitingDistance = Fighter.FIGHTER_ORBITING_DISTANCE_PLANET;
		});
		targetSquadron.fighters.push(...fighters);
	}

	private onFighterDestroyed(msg: MessageFighterDestroyed) {

		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		let squadron = planet.squadrons.get(msg.squadronId);

		if (squadron) {
			if (squadron.fighters.length === 0) {
				DebugInfo.warn('Cannot remove fighter from empty squadron');
				return;
			}

			let fighters = squadron.fighters.splice(squadron.fighters.length - 1);

			let destroyedFighter = fighters[0];

			DebugInfo.info('destroyedFighter ' + destroyedFighter);
			DebugInfo.info(`Fighter destroyed from squadron ${destroyedFighter.squadron.id},${squadron.fighters.length} fighters left.`);

			if (squadron.faction) {
				squadron.faction.numFighters--;
			}

			this.notify<EventFighterDestroyed>(GameEventType.FIGHTER_DESTROYED, {
				type: GameEventType.FIGHTER_DESTROYED,
				fighter: destroyedFighter
			});

			this._galaxyObjectfactory.releaseFighter(destroyedFighter);

			Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::fighterDestroyed: Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
		} else {
			console.error('Unknown squadron with id ' + msg.squadronId);
		}
	}

	private onPlanetConquered(msg: MessagePlanetConquered) {

		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		let oldFaction = this._galaxyDataHandler.factions.get(msg.fromFactionId);
		let newFaction = this._galaxyDataHandler.factions.get(msg.factionId);

		planet.faction = newFaction;

		if (oldFaction) {
			oldFaction.maxUpkeep -= planet.maxUpkeep;
			oldFaction.planets.splice(oldFaction.planets.indexOf(planet), 1);
		}

		newFaction.maxUpkeep += planet.maxUpkeep;
		newFaction.planets.push(planet);

		this.notify<EventPlanetConquered>(GameEventType.PLANET_CONQUERED, {
			type: GameEventType.PLANET_CONQUERED,
			faction: newFaction,
			planet: planet
		});
	}

	private onSquadronDestroyed(msg: MessageSquadronDestroyed) {
		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		let squadron = planet.squadrons.get(msg.squadronId);

		planet.squadrons.delete(squadron.id);
		DebugInfo.info(`Removed squadron ${squadron.id} from planet ${planet.name}, now ${planet.squadrons.length} on planet.`);

		this.deleteSquadron(squadron, planet);
	}

	private onFactionDestroyed(msg: MessageFactionDestroyed) {
		this.notify<EventFactionDestroyed>(GameEventType.FACTION_DESTROYED, {
			type: GameEventType.FACTION_DESTROYED,
			faction: this._galaxyDataHandler.factions.get(msg.factionId)
		});
	}
}