#pragma once

#include <atomic>
#include <mutex>
#include <thread>
#include <vector>
#include "Interfaces.h"

namespace server {

class GameManager {
public:
  static GameManager& instance();

  IGamePtr get_game(const JsonValue& value);

private:
  GameManager();
  ~GameManager();

  void thread_func();

  std::atomic<bool> m_stop{ };
  std::thread m_thread;
  std::mutex m_games_mutex;
  std::vector<IGamePtr> m_games;
};

} // namespace
