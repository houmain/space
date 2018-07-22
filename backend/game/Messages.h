#pragma once

#include "Types.h"

namespace game {

std::string build_game_joined_message(const std::vector<Faction>& factions,
  const std::vector<Planet>& planets,
  const std::vector<Squadron>& moving_squadrons,
  const Faction& faction);
std::string build_game_updated_message(double time_since_start);
std::string build_player_joined_message(const Faction& faction);
std::string build_player_left_message(const Faction& faction);
std::string build_fighter_created_message(const Squadron& squadron);
std::string build_fighter_destroyed_message(const Squadron& squadron,
  const Squadron& by_squadron);
std::string build_squadron_sent_message(const Squadron& source_squadron,
  const Squadron& squadron);
std::string build_squadrons_merged_message(const Squadron& squadron,
  const Squadron& into_squadron);
std::string build_squadron_attacks_message(const Squadron& squadron);
std::string build_squadron_destroyed_message(const Squadron& squadron);
std::string build_planet_conquered_message(const Planet& planet);
std::string build_faction_destroyed_message(const Faction& faction);
std::string build_faction_won_message(const Faction& faction);

struct SendSquadron {
  static auto action() { return "sendSquadron"; }
  PlanetId source_planet_id;
  PlanetId target_planet_id;
  int fighter_count;
};
SendSquadron parse_send_squadron_message(const json::Value& value);

} // namespace
