
#include "Game.h"
#include "Messages.h"
#include "Setup.h"
#include "Logic.h"
#include "Player.h"

namespace game {

Game::Game(GameId game_id, const messages::CreateGame& message)
  : m_game_id(game_id),
    m_name(message.name),
    m_password(message.password),
    m_max_players(message.max_players),
    m_setup(std::make_unique<Setup>(this)) {
}

Game::~Game() = default;

void Game::on_client_joined(Client& client, std::string_view client_id) {
  assert(!m_client_player_mapping.count(&client));

  auto it = std::find_if(begin(m_players), end(m_players),
    [&](auto& player) { return player->client_id() == client_id; });
  if (it == m_players.end()) {
    auto player_id = static_cast<PlayerId>(m_players.size());
    auto player = std::make_unique<Player>(
      this, static_cast<ClientId>(client_id), player_id);
    it = m_players.insert(m_players.end(), std::move(player));
  }

  auto& player = **it;
  m_client_player_mapping[&client] = player.player_id();
  client.send(messages::build_game_joined(player));
  for (const auto& message : m_last_chat_messages)
    client.send(messages::build_chat_message(message));
  broadcast(messages::build_player_joined(player));
}

void Game::on_client_left(Client& client) {
  auto it = m_client_player_mapping.find(&client);
  assert(it != m_client_player_mapping.end());

  const auto player_id = it->second;
  const auto& player = *m_players.at(static_cast<size_t>(player_id));
  client.send(messages::build_game_left(player));
  broadcast(messages::build_player_left(player));

  m_client_player_mapping.erase(it);
}

void Game::on_message_received(Client& client, const json::Value& value) {
  const auto action = json::get_string(value, "action");
  const auto player_id = m_client_player_mapping.at(&client);
  auto& player = *m_players.at(static_cast<size_t>(player_id));

  if (action == messages::SendSquadron::action)
    return m_logic->send_squadron(player.faction_id(),
      messages::parse_send_squadron(value));

  if (action == messages::SetupGame::action)
    return m_setup->setup(messages::parse_setup_game(value));

  if (action == messages::SetupPlayer::action)
    return player.setup(messages::parse_setup_player(value));

  if (action == messages::ChatMessage::action) {
    auto message = messages::parse_chat_message(value);
    message.player_id = player.player_id();
    return chat_message_received(std::move(message));
  }

  throw Exception("invalid action");
}

bool Game::verify_password(std::string_view password) const {
  return (m_password == password);
}

bool Game::is_running() const {
  return (m_logic != nullptr);
}

void Game::chat_message_received(messages::ChatMessage message) {
  broadcast(messages::build_chat_message(message));

  m_last_chat_messages.push_back(std::move(message));
  while (m_last_chat_messages.size() > 10)
    m_last_chat_messages.pop_front();
}

void Game::update() {
  if (!is_running())
    start_game();
  else
    update_game();
}

void Game::start_game() {
  assert(!m_logic);

  if (m_players.empty() ||
      !std::all_of(begin(m_players), end(m_players),
        [](const auto& player) { return player->ready(); }))
    return;

  m_logic = std::make_unique<Logic>(this);
}

void Game::update_game() {
  assert(m_logic);
  m_logic->update();
}

void Game::broadcast(std::string_view message) {
  for (auto [client, player] : m_client_player_mapping)
    client->send(std::string(message));
}

} // namespace
