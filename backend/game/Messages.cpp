
#include "Messages.h"

namespace game {

std::string build_game_joined_message(
    const std::vector<Faction>& factions,
    const std::vector<Planet>& planets,
    const std::map<int, Ship>& ships,
    const std::map<int, Squadron>& squadrons) {
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
      if (planet.owner) {
        writer.Key("owner");
        writer.Int(planet.owner->id);
      }
      if (!planet.ship_ids.empty()) {
        writer.Key("shipIds");
        writer.StartArray();
        for (auto id : planet.ship_ids)
          writer.Int(id);
        writer.EndArray();
      }
      writer.EndObject();
    }
    writer.EndArray();

    writer.Key("squadrons");
    writer.StartArray();
    for (const auto& [id, squadron] : squadrons) {
      writer.StartObject();
      writer.Key("id");
      writer.Int(id);
      writer.Key("targetPlanetId");
      writer.Int(squadron.target_planet->id);
      writer.Key("speed");
      writer.Double(squadron.speed);
      writer.Key("x");
      writer.Double(squadron.x);
      writer.Key("y");
      writer.Double(squadron.y);
      if (!squadron.ship_ids.empty()) {
        writer.Key("shipIds");
        writer.StartArray();
        for (auto id : squadron.ship_ids)
          writer.Int(id);
        writer.EndArray();
      }
      writer.EndObject();
    }
    writer.EndArray();

    writer.Key("ships");
    writer.StartArray();
    for (const auto& [id, ship] : ships) {
      writer.StartObject();
      writer.Key("id");
      writer.Int(id);
      writer.Key("energy");
      writer.Int(ship.energy);
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

std::string build_squadron_created_message(const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronCreated");
    writer.Key("squadronId");
    writer.Int(squadron.id);
    // TODO:
    writer.EndObject();
  });
}

std::string build_squadron_arrived_message(const Squadron& squadron) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("squadronArrived");
    writer.Key("squadronId");
    writer.Int(squadron.id);
    writer.EndObject();
  });
}

} // namespace
