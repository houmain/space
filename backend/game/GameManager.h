#pragma once

#include "Types.h"
#include "Messages.h"
#include <atomic>
#include <mutex>
#include <map>
#include <thread>

namespace game {

class GameManager : public interfaces::GameManager {
public:
  static GameManager& instance();

  void on_client_joined(Client& client) override;
  void on_client_left(Client& client) override;
  void on_message_received(Client& client,
    const json::Value& value) override;

private:
  using GamePtr = std::shared_ptr<Game>;

  GameManager();
  ~GameManager() override;

  void thread_func() noexcept;
  void update() noexcept;

  void reply_game_list(Client& client);
  void create_game(Client& client, const messages::CreateGame& message);
  void join_game(Client& client, const messages::JoinGame& message);
  void leave_game(Client& client);
  GamePtr get_game(GameId game_id);
  GamePtr get_game(Client& client);

  std::atomic<bool> m_stop{ };
  std::thread m_thread;
  std::mutex m_games_mutex;
  GameId m_next_game_id{ 1 };
  std::map<GameId, GamePtr> m_games;
  std::map<Client*, GamePtr> m_client_games_map;
};

} // namespace
