#pragma once

#include "Types.h"
#include "Messages.h"
#include <map>

namespace game {

class Game final {
public:
  Game(GameId game_id, const messages::CreateGame& message);
  ~Game();

  GameId game_id() const { return m_game_id; }
  const std::string& name() const { return m_name; }
  const Setup& setup() const { return *m_setup; }
  bool is_running() const;
  int max_players() const { return m_max_players; }
  int num_players() const { return static_cast<int>(m_players.size()); }
  bool verify_password(std::string_view password) const;
  void on_client_joined(Client& client, std::string_view client_id);
  void on_client_left(Client& client);
  void on_message_received(Client& client, const json::Value& value);
  void update();
  void broadcast(std::string_view message);

private:
  void chat_message_received(const messages::ChatMessage& message);
  void start_game();

  const GameId m_game_id;
  const std::string m_name;
  const std::string m_password;
  const int m_max_players;
  const std::unique_ptr<Setup> m_setup;
  std::unique_ptr<Logic> m_logic;
  std::vector<std::unique_ptr<Player>> m_players;
  std::map<Client*, PlayerId> m_client_player_mapping;
};

} // namespace
