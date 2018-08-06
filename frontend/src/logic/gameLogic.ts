import { GalaxyDataHandler } from './galaxyHandler';
import { ObservableServerMessageHandler } from '../communication/messageHandler';
import { MessageGameJoined, ServerMessageType, MessageFighterCreated, MessageSquadronSent, MessageSquadronsMerged, MessageSquadronAttacks, MessageFighterDestroyed, MessagePlanetConquered, MessageSquadronDestroyed } from '../communication/communicationInterfaces';
import { GalaxyFactory } from './galaxyFactory';
import { Player, GameState } from '../data/gameData';
import { Galaxy, Fighter, Squadron, Faction } from '../data/galaxyModels';
import { Assert } from '../common/utils';

export class GameLogic {

	private _galaxyDataHandler: GalaxyDataHandler;
	private _player: Player;
	private _galaxy: Galaxy;

	public constructor(gameState: GameState, serverMessageObserver: ObservableServerMessageHandler) {
		this._player = gameState.player;

		this._galaxy = gameState.galaxy;

		this._galaxyDataHandler = new GalaxyDataHandler(serverMessageObserver);

		serverMessageObserver.subscribe<MessageGameJoined>(ServerMessageType.GAME_JOINED, this.onGameJoined.bind(this));
		serverMessageObserver.subscribe<MessageFighterCreated>(ServerMessageType.FIGHTER_CREATED, this.onFighterCreated.bind(this));
		serverMessageObserver.subscribe<MessageSquadronSent>(ServerMessageType.SQUADRON_SENT, this.onSquadronSent.bind(this));
		serverMessageObserver.subscribe<MessageSquadronsMerged>(ServerMessageType.SQUADRONS_MERGED, this.onSquadronsMerged.bind(this));
		serverMessageObserver.subscribe<MessageSquadronAttacks>(ServerMessageType.SQUADRON_ATTACKS, this.onSquadronAttacks.bind(this));
		serverMessageObserver.subscribe<MessageFighterDestroyed>(ServerMessageType.FIGHTER_DESTROYED, this.onFighterDestroyed.bind(this));
		serverMessageObserver.subscribe<MessagePlanetConquered>(ServerMessageType.PLANET_CONQUERED, this.onPlanetConquered.bind(this));
		serverMessageObserver.subscribe<MessageSquadronDestroyed>(ServerMessageType.SQUADRON_DESTROYED, this.onSquadronDestroyed.bind(this));
	}

	private onGameJoined(msg: MessageGameJoined) {

		this._player.factionId = msg.factionId;

		GalaxyFactory.create(this._galaxy, msg.factions, msg.planets, msg.squadrons);

		this._galaxyDataHandler.init(this._galaxy);
	}

	private onFighterCreated(msg: MessageFighterCreated) {
		let squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (squadron) {
			squadron.fighters.push(new Fighter());
		} else {
			console.error('Unknown squadron with id ' + msg.squadronId);
		}

		Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::createFighter: squadron ${msg.squadronId}
        Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
	}

	private onSquadronSent(msg: MessageSquadronSent) {
		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (!sentSquadron) {
			sentSquadron = this.createSquadron(msg.factionId, msg.squadronId);
		}

		let sourceSquadron = this._galaxyDataHandler.squadrons[msg.sourceSquadronId];
		let sentFighters = sourceSquadron.fighters.splice(sourceSquadron.fighters.length - msg.fighterCount, msg.fighterCount);
		sentSquadron.fighters.push(sentFighters);
	}

	private createSquadron(factionId: number, squadronId: number): Squadron {
		// TODO update galaxy squadrons
		let squadron = new Squadron();
		squadron.id = squadronId;
		squadron.faction = this._galaxyDataHandler.factions[factionId];
		this._galaxyDataHandler.squadrons[squadronId] = squadron;
		return squadron;
	}

	private onSquadronsMerged(msg: MessageSquadronsMerged) {
		let sourceSquadron = this._galaxyDataHandler.squadrons[msg.squadronId];
		let targetSquadron = this._galaxyDataHandler.squadrons[msg.intoSquadronId];

		let fighters = sourceSquadron.fighters.splice(0, sourceSquadron.fighters.length);
		targetSquadron.fighters.push(fighters);

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

		delete this._galaxyDataHandler.squadrons[squadronId];
	}

	private onSquadronAttacks(msg: MessageSquadronAttacks) {
		let sentSquadron: Squadron = this._galaxyDataHandler.squadrons[msg.squadronId];
		let planet = this._galaxyDataHandler.planets[msg.planetId];
		planet.squadrons.push(sentSquadron);
	}

	private onFighterDestroyed(msg: MessageFighterDestroyed) {
		let squadron = this._galaxyDataHandler.squadrons[msg.squadronId];

		if (squadron) {
			squadron.fighters.splice(squadron.fighters.length - 2, 1);
			Assert.equals(squadron.fighters.length, msg.fighterCount, `Game::fighterDestroyed: Incorrect Fighter count client: ${squadron.fighters.length} server: ${msg.fighterCount}`);
		} else {
			console.error('Unknown squadron with id ' + msg.squadronId);
		}
	}

	private onPlanetConquered(msg: MessagePlanetConquered) {
		let faction = this._galaxyDataHandler.factions[msg.factionId];
		let planet = this._galaxyDataHandler.planets[msg.planetId];

		planet.faction = faction;
	}

	private onSquadronDestroyed(msg: MessageSquadronDestroyed) {
		this.deleteSquadron(msg.planetId, msg.squadronId);
	}
}
