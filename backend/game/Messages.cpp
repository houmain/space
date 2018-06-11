
#include "Messages.h"

namespace game {

std::string build_game_joined_message(const std::vector<Planet>& planets) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("gameJoined");

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

std::string build_player_joined_message(const Player& player) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerJoined");
    writer.Key("player");
    writer.Int(player.id);
    writer.EndObject();
  });
}

std::string build_player_left_message(const Player& player) {
  return json::build_message([&](json::Writer& writer) {
    writer.StartObject();
    writer.Key("event");
    writer.String("playerLeft");
    writer.Key("playerId");
    writer.Int(player.id);
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
