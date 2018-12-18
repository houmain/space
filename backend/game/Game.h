#pragma once

#include <map>
#include "Types.h"

namespace game {

class Game final : public interfaces::Game {
public:
  explicit Game(GameId game_id);
  void on_client_joined(Client& client) override;
  void on_client_left(Client& client) override;
  void on_message_received(Client& client, const json::Value& value) override;
  void update() override;

  void broadcast(std::string_view message);

private:
  const GameId m_game_id;
  std::unique_ptr<Setup> m_setup;
  std::unique_ptr<Logic> m_logic;
  std::vector<std::unique_ptr<Player>> m_players;
  std::map<Client*, size_t> m_client_player_mapping;
};

} // namespace
