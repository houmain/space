#pragma once

#include "Types.h"

namespace game::messages {

struct RequestGameList {
  static constexpr auto action = "requestGameList";
};

struct CreateGame {
  static constexpr auto action = "createGame";
  std::string_view name;
  std::string_view password;
  int max_players;
  std::string_view client_id;
};

struct JoinGame {
  static constexpr auto action = "joinGame";
  int game_id;
  std::string_view password;
  std::string_view client_id;
};

struct LeaveGame {
  static constexpr auto action = "leaveGame";
};

struct SetupGame {
  static constexpr auto action = "setupGame";
  std::optional<int> num_factions;
  std::optional<int> num_planets;
};

struct SetupPlayer {
  static constexpr auto action = "setupPlayer";
  std::optional<std::string_view> name;
  std::optional<std::string_view> avatar;
  std::optional<std::string_view> color;
  std::optional<FactionId> faction_id;
  std::optional<bool> ready;
};

struct ChatMessage {
  static constexpr auto action = "chatMessage";
  int player_id;
  std::string message;
};

struct SendSquadron {
  static constexpr auto action = "sendSquadron";
  PlanetId source_planet_id;
  PlanetId target_planet_id;
  int fighter_count;
};

CreateGame parse_create_game(const json::Value& value);
JoinGame parse_join_game(const json::Value& value);
LeaveGame parse_leave_game(const json::Value& value);
SetupGame parse_setup_game(const json::Value& value);
SetupPlayer parse_setup_player(const json::Value& value);
ChatMessage parse_chat_message(const json::Value& value);
SendSquadron parse_send_squadron(const json::Value& value);

std::string build_game_list(const std::vector<const Game*>& games);
std::string build_chat_message(const ChatMessage& message);
std::string build_game_joined(const Player& player);
std::string build_game_left(const Player& player);
std::string build_player_joined(const Player& player);
std::string build_player_left(const Player& player);
std::string build_player_setup_updated(const SetupPlayer& setup);
std::string build_game_setup_updated(const SetupGame& setup);
std::string build_game_started(
  const std::vector<Faction>& factions,
  const std::vector<Planet>& planets,
  const std::vector<Squadron>& moving_squadrons);
std::string build_game_updated(double time_since_start);
std::string build_fighter_created(const Squadron& squadron);
std::string build_fighter_destroyed(const Squadron& squadron,
  const Squadron& by_squadron);
std::string build_squadron_sent(const Squadron& source_squadron,
  const Squadron& squadron);
std::string build_squadrons_merged(const Squadron& squadron,
  const Squadron& into_squadron);
std::string build_squadron_attacks(const Squadron& squadron);
std::string build_squadron_destroyed(const Squadron& squadron);
std::string build_planet_conquered(const Squadron& squadron);
std::string build_faction_destroyed(const Faction& faction);
std::string build_faction_won(const Faction& faction);

} // namespace
