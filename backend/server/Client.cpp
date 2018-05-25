
#include "Client.h"
#include "GameManager.h"
#include "Interfaces.h"

namespace server {

Client::Client(SendFunction send)
  : m_send(std::move(send)) {
}

Client::~Client() {
  leave_game();
}

void Client::send(std::string message) {
  m_send(std::move(message));
}

void Client::on_received(std::string_view message) {
  try {
    const auto value = parse_json(message);
    const auto action = get_string(value, "action");

    if (action == "join")
      return join_game(value);

    if (action == "leave")
      return leave_game();

    if (!m_game)
      throw Exception("no game joined");

    m_game->on_message_received(this, value);
  }
  catch (const std::exception& ex) {
    send(ex.what());
  }
}

void Client::join_game(const JsonValue& value) {
  leave_game();

  m_game = GameManager::instance().get_game(value);
  m_game->on_client_joined(this);
}

void Client::leave_game() {
  if (auto game = std::exchange(m_game, nullptr))
    game->on_client_left(this);
}

} // namespace

std::unique_ptr<IClient> create_client(SendFunction send) {
  return std::make_unique<server::Client>(std::move(send));
}