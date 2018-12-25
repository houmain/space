#pragma once

#include "Json.h"
#include <memory>
#include <functional>

namespace interfaces {

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

struct GameManager : Interface {
  virtual void on_client_joined(Client& client) = 0;
  virtual void on_client_left(Client& client) = 0;
  virtual void on_message_received(Client& client,
    const json::Value& value) = 0;
};

std::unique_ptr<Client> create_client(SendFunction send);
GameManager& get_game_manager();

} // namespace
