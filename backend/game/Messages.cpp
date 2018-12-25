
#include "Messages.h"
#include "Player.h"
#include "Game.h"

namespace game::messages {

CreateGame parse_create_game(const json::Value& value) {
  return {
    json::get_string(value, "name"),
    json::get_string(value, "password"),
    json::get_int(value, "maxPlayers"),
    json::get_string(value, "clientId"),
  };
}

JoinGame parse_join_game(const json::Value& value) {
  return {
    json::get_int(value, "gameId"),
    json::get_string(value, "password"),
    json::get_string(value, "clientId"),
  };
}

SetupGame parse_setup_game(const json::Value& value) {
  return {
    json::try_get_int(value, "numFactions"),
    json::try_get_int(value, "numPlanets"),
  };
}

SetupPlayer parse_setup_player(const json::Value& value) {
  return {
    json::try_get_string(value, "name"),
    json::try_get_string(value, "avatar"),
    json::try_get_string(value, "color"),
    json::try_get_int(value, "factionId"),
    json::try_get_bool(value, "ready"),
  };
}

ChatMessage parse_chat_message(const json::Value& value) {
  return {
    json::get_int(value, "playerId"),
    std::string(json::get_string(value, "message")),
  };
}

SendSquadron parse_send_squadron(const json::Value& value) {
  return {
    json::get_int(value, "sourcePlanetId"),
    json::get_int(value, "targetPlanetId"),
    json::get_int(value, "fighterCount"),
  };
}

std::string build_game_list(const std::vector<const Game*>& games) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameList");
    writer.Key("games");
    writer.StartArray();
    for (const auto game : games) {
      writer.StartObject();
      writer.Key("gameId");
      writer.Int(game->game_id());
      writer.Key("name");
      writer.String(game->name());
      writer.Key("maxPlayers");
      writer.Int(game->max_players());
      writer.Key("numPlayers");
      writer.Int(game->num_players());
      writer.EndObject();
    }
    writer.EndArray();
    writer.EndObject();
  });
}

std::string build_chat_message(const ChatMessage& message) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("chatMessage");
    writer.Key("playerId");
    writer.Int(message.player_id);
    writer.Key("message");
    writer.String(message.message);
    writer.EndObject();
  });
}

std::string build_game_joined(const Player& player) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameJoined");
    writer.Key("gameId");
    writer.Int(player.game().game_id());
    writer.Key("playerId");
    writer.Int(player.player_id());
    writer.EndObject();
  });
}

std::string build_game_left(const Player& player) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameLeft");
    writer.Key("gameId");
    writer.Int(player.game().game_id());
    writer.Key("playerId");
    writer.Int(player.player_id());
    writer.EndObject();
  });
}

std::string build_player_joined(const Player& player) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerJoined");
    writer.Key("playerId");
    writer.Int(player.player_id());
    writer.EndObject();
  });
}

std::string build_player_left(const Player& player) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerLeft");
    writer.Key("playerId");
    writer.Int(player.player_id());
    writer.EndObject();
  });
}

std::string build_player_setup_updated(const SetupPlayer& setup) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerSetupUpdated");
    if (setup.name) {
      writer.Key("name");
      writer.String(setup.name->data()); // TODO: check for string_view support
    }
    if (setup.avatar) {
      writer.Key("avatar");
      writer.String(setup.avatar->data()); // TODO: check for string_view support
    }
    if (setup.color) {
      writer.Key("color");
      writer.String(setup.color->data()); // TODO: check for string_view support
    }
    if (setup.faction_id) {
      writer.Key("factionId");
      writer.Int(*setup.faction_id);
    }
    if (setup.ready) {
      writer.Key("ready");
      writer.Bool(*setup.ready);
    }
    writer.EndObject();
  });
}

std::string build_game_setup_updated(const SetupGame& setup) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameSetupUpdated");
    if (setup.num_factions) {
      writer.Key("numFactions");
      writer.Int(*setup.num_factions);
    }
    if (setup.num_planets) {
      writer.Key("numPlanets");
      writer.Int(*setup.num_planets);
    }
    writer.EndObject();
  });
}

std::string build_game_started(
    const std::vector<Faction>& factions,
    const std::vector<Planet>& planets,
    const std::vector<Squadron>& moving_squadrons) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameStarted");

    writer.Key("factions");
    writer.StartArray();
    for (const auto& faction : factions) {
      writer.StartObject();
      writer.Key("id");
      writer.Int(faction.id);
      writer.Key("name");
      writer.String(faction.name);
      writer.EndObject();
    }
    writer.EndArray();

    writer.Key("planets");
    writer.StartArray();
    for (const auto& planet : planets) {
      writer.StartObject();
      writer.Key("id");
      writer.Int(planet.id);
      writer.Key("name");
      writer.String(planet.name);
      writer.Key("initialAngle");
      writer.Double(planet.initial_angle);
      writer.Key("angularVelocity");
      writer.Double(planet.angular_velocity);
      writer.Key("distance");
      writer.Double(planet.distance);
      if (planet.parent) {
        writer.Key("parent");
        writer.Int(planet.parent->id);
      }
      if (planet.faction) {
        writer.Key("faction");
        writer.Int(planet.faction->id);
      }
      writer.Key("maxUpkeep");
      writer.Int(planet.max_upkeep);
      writer.Key("productionRate");
      writer.Double(planet.production_rate);
      writer.Key("productionProgress");
      writer.Double(planet.production_progress);
      writer.Key("defenseBonus");
      writer.Double(planet.defense_bonus);
      if (!planet.squadrons.empty()) {
        writer.Key("squadrons");
        writer.StartArray();
        for (const auto& squadron : planet.squadrons) {
          writer.StartObject();
          writer.Key("squadronId");
          writer.Int(squadron.id);
          writer.Key("fighterCount");
          writer.Int(squadron.fighter_count);
          if (squadron.faction) {
            writer.Key("factionId");
            writer.Int(squadron.faction->id);
          }
          writer.EndObject();
        }
        writer.EndArray();
      }
      writer.EndObject();
    }
    writer.EndArray();

    writer.Key("squadrons");
    writer.StartArray();
    for (const auto& squadron : moving_squadrons) {
      writer.StartObject();
      writer.Key("id");
      writer.Int(squadron.id);
      writer.Key("planetId");
      writer.Int(squadron.planet->id);
      writer.Key("factionId");
      writer.Int(squadron.faction->id);
      writer.Key("fighterCount");
      writer.Double(squadron.fighter_count);
      writer.Key("speed");
      writer.Double(squadron.speed);
      writer.Key("x");
      writer.Double(squadron.x);
      writer.Key("y");
      writer.Double(squadron.y);
      writer.EndObject();
    }
    writer.EndArray();

    writer.EndObject();
  });
}

std::string build_game_updated(double time_since_start) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameUpdated");
    writer.Key("time");
    writer.Double(time_since_start);
    writer.EndObject();
  });
}

std::string build_fighter_created(const Squadron& squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("fighterCreated");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.Key("fighterCount");
    writer.Int(squadron.fighter_count);
    writer.EndObject();
  });
}

std::string build_fighter_destroyed(const Squadron& squadron,
    const Squadron& by_squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("fighterDestroyed");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.Key("fighterCount");
    writer.Int(squadron.fighter_count);
    writer.Key("bySquadronId");
    writer.Int(by_squadron.id);
    writer.EndObject();
  });
}

std::string build_squadron_sent(const Squadron& source_squadron,
    const Squadron& squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronSent");
    writer.Key("sourcePlanetId");
    writer.Int(source_squadron.planet->id);
    writer.Key("targetPlanetId");
    writer.Int(squadron.planet->id);
    writer.Key("sourceSquadronId");
    writer.Int(source_squadron.id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.Key("factionId");
    writer.Int(squadron.faction->id);
    writer.Key("fighterCount");
    writer.Int(squadron.fighter_count);
    writer.Key("speed");
    writer.Double(squadron.speed);
    writer.EndObject();
  });
}

std::string build_squadrons_merged(const Squadron& squadron,
    const Squadron& into_squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronsMerged");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.Key("intoSquadronId");
    writer.Int(into_squadron.id);
    writer.Key("fighterCount");
    writer.Int(into_squadron.fighter_count);
    writer.EndObject();
  });
}

std::string build_squadron_attacks(const Squadron& squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronAttacks");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.EndObject();
  });
}

std::string build_squadron_destroyed(const Squadron& squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronDestroyed");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.EndObject();
  });
}

std::string build_planet_conquered(const Squadron& squadron) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("planetConquered");
    writer.Key("planetId");
    writer.Int(squadron.planet->id);
    if (auto from_faction = squadron.planet->faction) {
      writer.Key("fromFactionId");
      writer.Int(from_faction->id);
    }
    writer.Key("factionId");
    writer.Int(squadron.faction->id);
    writer.EndObject();
  });
}

std::string build_faction_destroyed(const Faction& faction) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("factionDestroyed");
    writer.Key("factionId");
    writer.Int(faction.id);
    writer.EndObject();
  });
}

std::string build_faction_won(const Faction& faction) {
  return json::build_string([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("factionWon");
    writer.Key("factionId");
    writer.Int(faction.id);
    writer.EndObject();
  });
}

} // namespace
