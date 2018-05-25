
#include "Game.h"

namespace game {

void Game::on_client_joined(IClient* client) {
  m_clients.push_back(client);
}

void Game::on_client_left(IClient* client) {
  m_clients.erase(std::find(begin(m_clients), end(m_clients), client));
}

void Game::on_message_received(IClient* client, const JsonValue& value) {
  // TODO:
  auto message = build_message(
    [&](JsonWriter& writer) {
      writer.StartObject();
      writer.Key("x"); writer.Double(100);
      writer.Key("y"); writer.Double(200);
      writer.EndObject();
    });
  broadcast(message);
}

void Game::update() {
}

void Game::broadcast(std::string_view message) {
  for (auto& client : m_clients)
    client->send(std::string(message));
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
