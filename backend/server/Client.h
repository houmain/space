#pragma once

#include "Interfaces.h"

namespace server {

class Client final : public IClient {
public:
  struct Exception : std::runtime_error {
    using runtime_error::runtime_error;
  };

  explicit Client(SendFunction send);
  ~Client() override;

  void send(std::string message) override;
  void on_received(std::string_view message) override;

private:
  void create_game(const json::Value& value);
  void join_game(const json::Value& value);
  void leave_game();

  const SendFunction m_send;
  IGamePtr m_game;
};

} // namespace
