#pragma once

#include <variant>
#include "../Interfaces.h"

namespace server {

struct Exception : std::runtime_error {
  using runtime_error::runtime_error;
};

class Client final : public interfaces::Client {
public:
  using SendFunction = interfaces::SendFunction;

  explicit Client(SendFunction send);
  ~Client() override;

  void send(std::string message) override;
  void on_received(std::string_view message) override;

private:
  using GamePtr = std::shared_ptr<interfaces::Game>;

  void create_game(const json::Value& value);
  void join_game(const json::Value& value);
  void leave_game();

  const interfaces::SendFunction m_send;
  GamePtr m_game;
};

} // namespace
