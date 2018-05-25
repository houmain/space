#pragma once

#include "Interfaces.h"

namespace game {

class Game final : public IGame {
public:
  void on_client_joined(IClient* client) override;
  void on_client_left(IClient* client) override;
  void on_message_received(IClient* client, const JsonValue& value) override;
  void update() override;

private:
  void broadcast(std::string_view message);

  std::vector<IClient*> m_clients;
};

} // namespace
