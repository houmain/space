#pragma once

#include <atomic>
#include <mutex>
#include <map>
#include <thread>
#include <vector>
#include <variant>
#include "../Interfaces.h"

namespace server {

class GameManager final {
public:
  using GameId = interfaces::GameId;
  using GamePtr = std::shared_ptr<interfaces::Game>;

  static GameManager& instance();

  GamePtr create_game();
  GamePtr get_game(GameId game_id);

private:
  using WeakGamePtr = std::weak_ptr<interfaces::Game>;

  GameManager();
  ~GameManager();

  void thread_func() noexcept;
  void update() noexcept;

  std::atomic<bool> m_stop{ };
  std::thread m_thread;
  std::mutex m_games_mutex;
  GameId m_next_game_id{ 1 };
  std::map<GameId, WeakGamePtr> m_games;
};

} // namespace
