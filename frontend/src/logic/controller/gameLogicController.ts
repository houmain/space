import { GalaxyDataHandler } from '../data/galaxyDataHandler';
import { ObservableServerMessageHandler } from '../../communication/messageHandler';
import { MessageGameJoined, ServerMessageType, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed, MessagePlayerJoined, MessageFactionDestroyed } from '../../communication/communicationInterfaces';
import { Player } from '../../data/gameData';
import { Fighter, Squadron, Faction, Planet } from '../../data/galaxyModels';
import { Assert, ErrorChecker, DebugInfo } from '../../common/debug';
import { GameEventNotifier, GameEvent, EventPlayerJoined, GameEventType, EventFighterCreated, EventSquadronCreated, EventSquadronDestroyed, EventFighterDestroyed, EventPlanetConquered, EventFactionDestroyed } from '../event/eventInterfaces';
import { GalaxyObjectFactory } from '../data/galaxyObjectFactory';
import { GalaxyFactory } from '../data/galaxyFactory';

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
		serverMessageObserver.subscribe<MessageSquadronAttacks>(ServerMessageType.SQUADRON_ATTACKS, this.onSquadronAttacks.bind(this));
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
		this.notify<EventPlayerJoined>(GameEventType.PLAYER_JOINED, {
			type: GameEventType.PLAYER_JOINED,
			faction: this._galaxyDataHandler.factions.get(msg.factionId)
		} as EventPlayerJoined);
	}

	private onFighterCreated(msg: MessageFighterCreated) {
		let squadron = this._galaxyDataHandler.squadrons.get(msg.squadronId);

		if (squadron) {
			let fighter = this._galaxyObjectfactory.buildFighter();
			fighter.setPositon(squadron.planet.x, squadron.planet.y);
			fighter.orbitingAngle = 0;
			fighter.squadron = squadron;
			squadron.fighters.push(fighter);

			if (squadron.faction) {
				squadron.faction.numFighters++;
			}

			this.notify<EventFighterCreated>(GameEventType.FIGHTER_CREATED, {
				type: GameEventType.FIGHTER_CREATED,
				fighter: fighter
			});

		} else {
			DebugInfo.error('Unknown squadron with id ' + msg.squadronId);
		}

		Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::createFighter: squadron ${msg.squadronId}
		Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);

		ErrorChecker.checkAllFightersHaveSprites(this._galaxyDataHandler);
	}

	private onSquadronSent(msg: MessageSquadronSent) {

		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons.get(msg.squadronId);

		if (!sentSquadron) {
			let faction = this._galaxyDataHandler.factions.get(msg.factionId);
			let targetPlanet = this._galaxyDataHandler.planets.get(msg.targetPlanetId);

			sentSquadron = this.createSquadron(msg.squadronId, faction, targetPlanet);
		}

		let sourceSquadron = this._galaxyDataHandler.squadrons.get(msg.sourceSquadronId);
		let sentFighters: Fighter[] = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - msg.fighterCount, msg.fighterCount);

		sentFighters.forEach(figher => {
			figher.squadron = sentSquadron;
		});
		sentSquadron.fighters.push(...sentFighters);

		DebugInfo.info(`Sending squadron. Now ${this._galaxyDataHandler.squadrons.length} squadrons`);
	}

	private createSquadron(squadronId: number, faction: Faction, planet: Planet) {
		let squadron = this._galaxyObjectfactory.buildSquadron();

		squadron.id = squadronId;
		squadron.faction = faction;
		squadron.planet = planet;
		squadron.makeDynamic();

		this._galaxyDataHandler.squadrons.add(squadronId, squadron);

		this._gameEventNotifier.notify<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, {
			type: GameEventType.SQUADRON_CREATED,
			squadron: squadron
		});

		ErrorChecker.checkAllSquadronsHaveSprites(this._galaxyDataHandler);

		return squadron;
	}

	private onSquadronsMerged(msg: MessageSquadronsMerged) {

		let sourceSquadron = this._galaxyDataHandler.squadrons.get(msg.squadronId);
		let targetSquadron = this._galaxyDataHandler.squadrons.get(msg.intoSquadronId);

		let fighters: Fighter[] = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
		targetSquadron.fighters.push(...fighters);

		Assert.equals(targetSquadron.fighters.length, msg.fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${msg.fighterCount}`);

		this.deleteSquadron(msg.planetId, msg.squadronId);

		DebugInfo.info(`Sqaudrons merged. Now ${this._galaxyDataHandler.squadrons.length} squadrons`);
	}

	private deleteSquadron(planetId: number, squadronId: number) {
		let planet = this._galaxyDataHandler.planets.get(planetId);
		let squadron = this._galaxyDataHandler.squadrons.get(squadronId);

		let index = planet.squadrons.indexOf(squadron);
		if (index !== -1) {
			planet.squadrons.splice(index, 1);
		} else {
			DebugInfo.error('Unknown squadron with id ' + squadronId);
		}

		this._gameEventNotifier.notify<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, {
			type: GameEventType.SQUADRON_DESTROYED,
			squadron: squadron
		});

		this._galaxyDataHandler.squadrons.delete(squadronId);
		this._galaxyObjectfactory.releaseSquadron(squadron);
	}

	private onSquadronAttacks(msg: MessageSquadronAttacks) {

		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons.get(msg.squadronId);
		let planet = this._galaxyDataHandler.planets.get(msg.planetId);
		sentSquadron.makeStatic();
		planet.squadrons.push(sentSquadron);
	}

	private onFighterDestroyed(msg: MessageFighterDestroyed) {

		ErrorChecker.checkAllFightersHaveSprites(this._galaxyDataHandler);

		let squadron = this._galaxyDataHandler.squadrons.get(msg.squadronId);

		if (squadron) {
			let fighters = squadron.fighters.splice(squadron.fighters.length - 1);

			let destroyedFighter = fighters[0];

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
		this.deleteSquadron(msg.planetId, msg.squadronId);

		DebugInfo.info(`Squadron destroyed. Now ${this._galaxyDataHandler.squadrons.length} squadrons`);
	}

	private onFactionDestroyed(msg: MessageFactionDestroyed) {
		this.notify<EventFactionDestroyed>(GameEventType.FACTION_DESTROYED, {
			type: GameEventType.FACTION_DESTROYED,
			faction: this._galaxyDataHandler.factions.get(msg.factionId)
		});
	}
}
