
#include "Game.h"
#include "Messages.h"
#include "Setup.h"
#include "Logic.h"
#include "Player.h"

namespace game {

Game::Game(GameId game_id)
  : m_game_id(game_id) {
}

void Game::on_client_joined(Client& client) {
  assert(!m_client_player_mapping.count(&client));

  // TODO: limit number of players
  m_players.push_back(std::make_unique<Player>(*this));
  m_client_player_mapping[&client] = m_players.size();
}

void Game::on_client_left(Client& client) {
  auto it = m_client_player_mapping.find(&client);
  assert(it != m_client_player_mapping.end());
  m_client_player_mapping.erase(it);
}

void Game::on_message_received(Client& client, const json::Value& value) {
  const auto action = json::get_string(value, "action");
  auto& player = m_players.at(m_client_player_mapping.at(&client));

  if (action == SendSquadron::action)
    return m_logic->send_squadron(player->faction_id(),
      parse_send_squadron_message(value));

  if (action == SetupGame::action)
    return m_setup->setup(parse_setup_game_message(value));

  if (action == SetupPlayer::action)
    return player->setup(parse_setup_player_message(value));

  throw Exception("invalid action");
}

void Game::update() {
  if (m_logic)
    m_logic->update();
}

void Game::broadcast(std::string_view message) {
  for (auto [client, player] : m_client_player_mapping)
    client->send(std::string(message));
}

} // namespace

std::shared_ptr<interfaces::Game> interfaces::create_game(GameId id) {
  return std::make_shared<game::Game>(id);
}
