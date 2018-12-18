
#include <iostream>
#include "GameManager.h"
#include "../Interfaces.h"

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

auto GameManager::create_game() -> GamePtr {
  auto lock = std::lock_guard(m_games_mutex);
  auto game = interfaces::create_game(m_next_game_id);
  m_games[m_next_game_id] = game;
  m_next_game_id++;
  return game;
}

auto GameManager::get_game(GameId game_id) -> GamePtr {
  auto lock = std::lock_guard(m_games_mutex);
  return GamePtr(m_games.at(game_id));
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
      if (auto game = it->second.lock()) {
        game->update();
        ++it;
        continue;
      }
    }
    catch (const std::exception& ex) {
      std::cerr << "unhandled exception: " << ex.what() << std::endl;
    }
    it = m_games.erase(it);
  }
}

} // namespace
