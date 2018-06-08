#pragma once

#include <memory>
#include <functional>
#include "Json.h"

using IClientPtr = std::unique_ptr<struct IClient>;
using IGamePtr = std::shared_ptr<struct IGame>;
using SendFunction = std::function<void(std::string)>;

struct Interface {
  Interface() = default;
  Interface(const Interface&) = delete;
  Interface& operator=(const Interface&) = delete;
  virtual ~Interface() = default;
};

struct IClient : Interface {
  virtual void send(std::string message) = 0;
  virtual void on_received(std::string_view message) = 0;
};

struct IGame : Interface {
  virtual void on_client_joined(IClient* client) = 0;
  virtual void on_client_left(IClient* client) = 0;
  virtual void on_message_received(IClient* client, const json::Value& value) = 0;
  virtual void update() = 0;
};

IClientPtr create_client(SendFunction send);
IGamePtr create_game();
