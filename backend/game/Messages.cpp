
#include "Messages.h"

namespace game {

std::string build_game_joined_message(
    const std::vector<Faction>& factions,
    const std::vector<Planet>& planets,
    const std::vector<Squadron>& moving_squadrons) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameJoined");

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
      writer.Key("figtherCount");
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

std::string build_game_updated_message(double time_since_start) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameUpdated");
    writer.Key("time");
    writer.Double(time_since_start);
    writer.EndObject();
  });
}

std::string build_player_joined_message([[maybe_unused]] const IClient& client,
    const Faction& faction) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerJoined");
    writer.Key("factionId");
    writer.Int(faction.id);
    writer.EndObject();
  });
}

std::string build_player_left_message([[maybe_unused]]const IClient& client,
    const Faction& faction) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerLeft");
    writer.Key("factionId");
    writer.Int(faction.id);
    writer.EndObject();
  });
}

std::string build_figther_created_message(const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
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

std::string build_figther_destroyed_message(const Squadron& squadron, const Squadron& by_squadron) {
  return json::build_message([&](json::Writer& writer) {
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

std::string build_squadron_sent_message(const Planet& source_planet, const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronSent");
    writer.Key("sourcePlanetId");
    writer.Int(source_planet.id);
    writer.Key("targetPlanetId");
    writer.Int(squadron.planet->id);
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

std::string build_squadrons_merged_message(const Squadron& squadron, const Squadron& into_squadron) {
  return json::build_message([&](json::Writer& writer) {
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

std::string build_squadron_attacks_message(const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
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

std::string build_squadron_destroyed_message(const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
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

std::string build_planet_conquered(const Planet& planet) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("planetConquered");
    writer.Key("planetId");
    writer.Int(planet.id);
    writer.Key("factionId");
    writer.Int(planet.faction->id);
    writer.EndObject();
  });
}

std::string build_faction_destroyed(const Faction& faction) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("factionDestroyed");
    writer.Key("factionId");
    writer.Int(faction.id);
    writer.EndObject();
  });
}

} // namespace
