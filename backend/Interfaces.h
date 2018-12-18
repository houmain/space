#pragma once

#include <memory>
#include <functional>
#include "Json.h"

namespace interfaces {

using GameId = int;
using SendFunction = std::function<void(std::string)>;

struct Interface {
  Interface() = default;
  Interface(const Interface&) = delete;
  Interface& operator=(const Interface&) = delete;
  virtual ~Interface() = default;
};

struct Client : Interface {
  virtual void send(std::string message) = 0;
  virtual void on_received(std::string_view message) = 0;
};

struct Game : Interface {
  virtual void on_client_joined(Client& client) = 0;
  virtual void on_client_left(Client& client) = 0;
  virtual void on_message_received(Client& client,
    const json::Value& value) = 0;
  virtual void update() = 0;
};

std::unique_ptr<Client> create_client(SendFunction send);
std::shared_ptr<Game> create_game(GameId game_id);

} // namespace
