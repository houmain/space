#pragma once

#include <atomic>
#include <mutex>
#include <map>
#include <thread>
#include <vector>
#include "Interfaces.h"

namespace server {

class GameManager {
public:
  static GameManager& instance();

  IGamePtr create_game(const json::Value& value);
  IGamePtr get_game(const json::Value& value);

private:
  GameManager();
  ~GameManager();

  void thread_func();

  std::atomic<bool> m_stop{ };
  std::thread m_thread;
  std::mutex m_games_mutex;
  GameId m_next_game_id{ 1 };
  std::map<GameId, IWeakGamePtr> m_games;
};

} // namespace
