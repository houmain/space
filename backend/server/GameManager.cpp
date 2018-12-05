
#include "GameManager.h"
#include "Interfaces.h"

namespace server {

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

void GameManager::thread_func() {
  while (!m_stop.load()) {
    std::this_thread::sleep_for(std::chrono::milliseconds(250));

    auto lock = std::lock_guard(m_games_mutex);
    for (auto it = m_games.begin(); it != m_games.end(); )
      if (auto game = it->second.lock()) {
        game->update();
        ++it;
      }
      else {
        it = m_games.erase(it);
      }
  }
}

IGamePtr GameManager::create_game(const json::Value& value) {
  auto lock = std::lock_guard(m_games_mutex);

  auto game = ::create_game(m_next_game_id);

  m_games[m_next_game_id] = game;
  m_next_game_id++;

  return game;
}

IGamePtr GameManager::get_game(const json::Value& value) {
  auto lock = std::lock_guard(m_games_mutex);

  auto game_id = json::get_int(value, "gameId");
  return IGamePtr(m_games.at(game_id));
}

} // namespace
