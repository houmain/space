
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
    for (auto& game : m_games)
      game->update();
  }
}

IGamePtr GameManager::get_game(const JsonValue& value) {
  auto lock = std::lock_guard(m_games_mutex);

  // TODO: add some more logic to select game
  if (m_games.empty())
    m_games.push_back(create_game());
  return m_games.front();
}

} // namespace
