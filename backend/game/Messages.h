#pragma once

#include "Types.h"

namespace game {

std::string build_game_joined_message(
  const std::vector<Faction>& factions,
  const std::vector<Planet>& planets,
  const std::vector<Squadron>& moving_squadrons);
std::string build_game_updated_message(double time_since_start);
std::string build_player_joined_message(const IClient& client, const Faction& faction);
std::string build_player_left_message(const IClient& client, const Faction& faction);
std::string build_fighter_created_message(const Squadron& squadron);
std::string build_fighter_destroyed_message(const Squadron& squadron, const Squadron& by_squadron);
std::string build_squadron_sent_message(const Planet& source_planet, const Squadron& squadron);
std::string build_squadrons_merged_message(const Squadron& squadron, const Squadron& into_squadron);
std::string build_squadron_attacks_message(const Squadron& squadron);
std::string build_squadron_destroyed_message(const Squadron& squadron);
std::string build_planet_conquered(const Planet& planet);
std::string build_faction_destroyed(const Faction& faction);

} // namespace
