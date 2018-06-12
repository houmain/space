#pragma once

#include <map>
#include "Types.h"

namespace game {

std::string build_game_joined_message(
  const std::vector<Faction>& factions,
  const std::vector<Planet>& planets,
  const std::map<int, Ship>& ships,
  const std::map<int, Squadron>& squadrons);
std::string build_game_updated_message(double time_since_start);
std::string build_player_joined_message(const IClient& client, const Faction& faction);
std::string build_player_left_message(const IClient& client, const Faction& faction);
std::string build_squadron_created_message(const Squadron& squadron);
std::string build_squadron_arrived_message(const Squadron& squadron);

} // namespace
