
#include "GameManager.h"
#include "Game.h"
#include <iostream>

namespace game {

GameManager& GameManager::instance() {
  static auto s_instance = GameManager();
  return s_instance;
}

GameManager::GameManager()
  : m_thread(&GameManager::thread_func, this) {
}

GameManager::~GameManager() {
  m_stop.store(true);
  if (m_thread.joinable())
    m_thread.join();
}

void GameManager::on_client_joined(Client&) {
  // nothing to do
}

void GameManager::on_client_left(Client& client) {
  auto lock = std::lock_guard(m_games_mutex);
  leave_game(client);
}

void GameManager::on_message_received(Client& client,
    const json::Value& value) {
  auto lock = std::lock_guard(m_games_mutex);
  const auto action = json::get_string(value, "action");

  if (action == messages::RequestGameList::action)
    return reply_game_list(client);

  if (action == messages::CreateGame::action)
    return create_game(client, messages::parse_create_game(value));

  if (action == messages::JoinGame::action)
    return join_game(client, messages::parse_join_game(value));

  if (action == messages::LeaveGame::action)
    return leave_game(client);

  get_game(client)->on_message_received(client, value);
}

void GameManager::thread_func() noexcept {
  while (!m_stop.load()) {
    update();
    std::this_thread::sleep_for(std::chrono::milliseconds(250));
  }
}

void GameManager::update() noexcept {
  auto lock = std::lock_guard(m_games_mutex);
  for (auto it = m_games.begin(); it != m_games.end(); ) {
    try {
      it->second->update();
      ++it;
      continue;
    }
    catch (const std::exception& ex) {
      std::cerr << "unhandled exception: " << ex.what() << std::endl;
    }
    it = m_games.erase(it);
  }
}

void GameManager::reply_game_list(Client& client) {
  auto games = std::vector<const Game*>();
  for (const auto& [id, game] : m_games)
    games.push_back(game.get());
  client.send(messages::build_game_list(games));
}

void GameManager::create_game(Client& client, const messages::CreateGame& message) {
  leave_game(client);
  const auto game_id = m_next_game_id++;
  auto game = std::make_shared<Game>(game_id, message);
  m_games[game_id] = game;
  m_client_games_map[&client] = game;
  game->on_client_joined(client, message.client_id);
}

void GameManager::join_game(Client& client, const messages::JoinGame& message) {
  leave_game(client);
  auto game = get_game(message.game_id);
  if (!game->verify_password(message.password))
    throw Exception("invalid password");
  m_client_games_map[&client] = game;
  game->on_client_joined(client, message.client_id);
}

void GameManager::leave_game(Client& client) {
  auto it = m_client_games_map.find(&client);
  if (it != m_client_games_map.cend()) {
    it->second->on_client_left(client);
    m_client_games_map.erase(it);
  }
}

auto GameManager::get_game(GameId game_id) -> GamePtr {
  auto it = m_games.find(game_id);
  if (it != m_games.end())
    return it->second;
  throw Exception("invalid game id");
}

auto GameManager::get_game(Client& client) -> GamePtr {
  auto it = m_client_games_map.find(&client);
  if (it != m_client_games_map.end())
    return it->second;
  throw Exception("no game joined");
}

} // namespace

interfaces::GameManager& interfaces::get_game_manager() {
  return game::GameManager::instance();
}
