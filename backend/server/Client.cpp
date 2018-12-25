
#include "Client.h"
#include "../Interfaces.h"

namespace server {

Client::Client(interfaces::SendFunction send)
  : m_send(std::move(send)) {

  interfaces::get_game_manager().on_client_joined(*this);
}

Client::~Client() {
  interfaces::get_game_manager().on_client_left(*this);
}

void Client::send(std::string message) {
  m_send(std::move(message));
}

void Client::on_received(std::string_view message) {
  try {
    const auto value = json::parse(message);
    interfaces::get_game_manager().on_message_received(*this, value);
  }
  catch (const std::exception& ex) {
    send(ex.what());
  }
}

} // namespace

std::unique_ptr<interfaces::Client> interfaces::create_client(SendFunction send) {
  return std::make_unique<server::Client>(std::move(send));
}

