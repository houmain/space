
#include <cassert>
#include "Game.h"

namespace game {

Game::Game() {
  m_players.resize(4);
}

void Game::on_client_joined(IClient* client) {
  assert(!m_clients.count(client));

  auto player = [&]() {
    for (auto& player : m_players)
      if (!player.client)
        return &player;
    throw Exception("no player left");
  }();

  m_clients[client] = player;
  player->client = client;

  broadcast(json::build_message(
    [&](json::Writer& writer) {
      writer.StartObject();
      writer.Key("event"); writer.String("playerJoined");
      writer.Key("player"); writer.Int(player->id);
      writer.EndObject();
    }));
}

void Game::on_client_left(IClient* client) {
  assert(m_clients.count(client));

  auto player = m_clients[client];
  player->client = nullptr;
  m_clients.erase(client);

  broadcast(json::build_message(
    [&](json::Writer& writer) {
      writer.StartObject();
      writer.Key("event"); writer.String("playerLeft");
      writer.Key("playerId"); writer.Int(player->id);
      writer.EndObject();
    }));
}

void Game::on_message_received(IClient* client, const json::Value& value) {
  auto it = m_clients.find(client);
  if (it == cend(m_clients))
    return;
  auto& player = *it->second;

  const auto action = json::get_string(value, "action");
  if (action == "sendSquadron")
    return send_squadron(player, value);

  throw Exception("invalid action");
}

void Game::update() {
}

void Game::broadcast(std::string_view message) {
  for (auto [client, player] : m_clients)
    client->send(std::string(message));
}

void Game::send_squadron(Player& player, const json::Value& value) {
  auto squadron = Squadron();
  squadron.id = 1;

  //...
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
