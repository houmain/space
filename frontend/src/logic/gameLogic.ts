import { GalaxyDataHandler } from './galaxyDataHandler';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessageGameJoined, ServerMessageType, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed, MessagePlayerJoined, MessageFactionDestroyed } from '../communication/communicationInterfaces';
import { GalaxyFactory } from './galaxyFactory';
import { Player, GameState } from '../data/gameData';
import { Galaxy, Fighter, Squadron, Faction, Planet } from '../data/galaxyModels';
import { Assert, Pool } from '../common/utils';
import { GameEvent, HandleGameEvent, EventFighterCreated, EventFighterDestroyed, GameEventType, EventPlayerJoined, EventPlanetConquered, EventFactionDestroyed, GameEventNotifier, GameEventObserver, EventSquadronCreated, EventSquadronDestroyed } from './eventInterfaces';

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

export class GameEventObserverImpl implements GameEventNotifier, GameEventObserver {

	private _handlers: { [eventKey: string]: HandleGameEvent<GameEvent>[]; } = {};

	public subscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		if (!this._handlers[eventId]) {
			this._handlers[eventId] = [];
		}
		this._handlers[eventId].push(callback);
	}

	public unsubscribe<T extends GameEvent>(eventId: string, callback: HandleGameEvent<T>) {
		let index = this._handlers[eventId].indexOf(callback);
		if (index !== -1) {
			this._handlers[eventId].splice(index, 1);
		}
	}

	public notify<T extends GameEvent>(eventId: string, event: T) {
		let subscribers = this._handlers[eventId];
		if (subscribers) {
			subscribers.forEach(notify => {
				notify(event as T);
			});
		}
	}
}

export class GameLogic {

	private _galaxyDataHandler: GalaxyDataHandler;
	private _player: Player;
	private _galaxy: Galaxy;

	private _gameEventNotifier: GameEventNotifier;

	private _galaxyObjectfactory: GalaxyObjectFactory;

	public constructor(gameState: GameState, serverMessageObserver: ObservableServerMessageHandler, galaxyDataHandler: GalaxyDataHandler, gameEventNotifier: GameEventNotifier) {
		this._player = gameState.player;

		this._galaxy = gameState.galaxy;

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

		console.log('handling onGameJoined');

		GalaxyFactory.create(this._galaxyObjectfactory, this._galaxy, msg.factions, msg.planets, msg.squadrons);

		this._galaxyDataHandler.init(this._galaxy);

		this._player.faction = this._galaxyDataHandler.factions[msg.factionId];
	}

	private onPlayerJoined(msg: MessagePlayerJoined) {
		this.notify<EventPlayerJoined>(GameEventType.PLAYER_JOINED, {
			type: GameEventType.PLAYER_JOINED,
			faction: this._galaxyDataHandler.factions[msg.factionId]
		} as EventPlayerJoined);
	}

	private onFighterCreated(msg: MessageFighterCreated) {
		let squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (squadron) {
			let fighter = this._galaxyObjectfactory.buildFighter();
			fighter.x = squadron.planet.x;
			fighter.y = squadron.planet.y;
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
			console.error('Unknown squadron with id ' + msg.squadronId);
		}

		Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::createFighter: squadron ${msg.squadronId}
        Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
	}

	private onSquadronSent(msg: MessageSquadronSent) {
		console.log(JSON.stringify(msg));

		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (!sentSquadron) {
			console.log('create new squadron');
			let faction = this._galaxyDataHandler.factions[msg.factionId];
			let targetPlanet = this._galaxyDataHandler.planets[msg.targetPlanetId];

			sentSquadron = this.createSquadron(msg.squadronId, faction, targetPlanet);
		}

		let sourceSquadron = this._galaxyDataHandler.squadrons[msg.sourceSquadronId];
		let sentFighters: Fighter[] = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - msg.fighterCount, msg.fighterCount);
		console.log('handing over ' + sentFighters.length + ' fighters');
		sentFighters.forEach(figher => {
			figher.squadron = sentSquadron;
		});
		sentSquadron.fighters.push(...sentFighters);
	}

	private createSquadron(squadronId: number, faction: Faction, planet: Planet) {
		// TODO update galaxy squadrons or remove squadrons from galaxy
		let squadron = this._galaxyObjectfactory.buildSquadron();

		squadron.id = squadronId;
		squadron.faction = faction;
		squadron.planet = planet;

		this._galaxyDataHandler.squadrons[squadronId] = squadron;

		this._gameEventNotifier.notify<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, {
			type: GameEventType.SQUADRON_CREATED,
			squadron: squadron
		});

		return squadron;
	}
	/*
		private createSquadron(factionId: number, squadronId: number): Squadron {
			// TODO update galaxy squadrons
			let squadron = new Squadron();
			squadron.id = squadronId;
			squadron.faction = this._galaxyDataHandler.factions[factionId];
			this._galaxyDataHandler.squadrons[squadronId] = squadron;

			this._gameEventNotifier.notify<EventSquadronCreated>(GameEventType.SQUADRON_CREATED, {
				type: GameEventType.SQUADRON_CREATED,
				squadron: squadron
			});

			return squadron;
		}*/

	private onSquadronsMerged(msg: MessageSquadronsMerged) {

		console.log(JSON.stringify(msg));

		let sourceSquadron = this._galaxyDataHandler.squadrons[msg.squadronId];
		let targetSquadron = this._galaxyDataHandler.squadrons[msg.intoSquadronId];

		let fighters: Fighter[] = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
		targetSquadron.fighters.push(...fighters);

		Assert.equals(targetSquadron.fighters.length, msg.fighterCount, `Game::squadronsMerged: Incorrect Fighter count client: ${targetSquadron.fighters.length} server: ${msg.fighterCount}`);

		this.deleteSquadron(msg.planetId, msg.squadronId);
	}

	private deleteSquadron(planetId: number, squadronId: number) {
		// TODO update galaxy squadrons
		let planet = this._galaxyDataHandler.planets[planetId];
		let squadron = this._galaxyDataHandler.squadrons[squadronId];

		let index = planet.squadrons.indexOf(squadron);
		if (index !== -1) {
			planet.squadrons.splice(index, 1);
		}

		this._gameEventNotifier.notify<EventSquadronDestroyed>(GameEventType.SQUADRON_DESTROYED, {
			type: GameEventType.SQUADRON_DESTROYED,
			squadron: squadron
		});

		delete this._galaxyDataHandler.squadrons[squadronId];

		this._galaxyObjectfactory.releaseSquadron(squadron);
	}

	private onSquadronAttacks(msg: MessageSquadronAttacks) {

		console.log(JSON.stringify(msg));

		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons[msg.squadronId];
		let planet = this._galaxyDataHandler.planets[msg.planetId];
		planet.squadrons.push(sentSquadron);
	}

	private onFighterDestroyed(msg: MessageFighterDestroyed) {
		let squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (squadron) {
			let fighters = squadron.fighters.splice(squadron.fighters.length - 2, 1);
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

		console.log(JSON.stringify(msg));

		let planet = this._galaxyDataHandler.planets[msg.planetId];
		let oldFaction = this._galaxyDataHandler.factions[msg.fromFactionId];
		let newFaction = this._galaxyDataHandler.factions[msg.factionId];

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

		console.log(JSON.stringify(msg));

		this.deleteSquadron(msg.planetId, msg.squadronId);
	}

	private onFactionDestroyed(msg: MessageFactionDestroyed) {

		console.log(JSON.stringify(msg));

		this.notify<EventFactionDestroyed>(GameEventType.FACTION_DESTROYED, {
			type: GameEventType.FACTION_DESTROYED,
			faction: this._galaxyDataHandler.factions[msg.factionId]
		});
	}
}
