
#include <cassert>
#include <cmath>
#include "Game.h"

namespace game {

Game::Game() {
  m_start_time = Clock::now();
  m_last_update_time = Clock::now();

  for (auto i = 0; i < 4; ++i) {
    auto& player = m_players.emplace_back();
    player.id = i + 1;
  }

  auto next_planet_id = 1;
  m_planets.reserve(50);
  auto& sun = m_planets.emplace_back();
  sun.id = next_planet_id++;
  for (auto i = 0; i < 4; ++i) {
    auto& planet = m_planets.emplace_back();
    planet.id = next_planet_id++;
    planet.parent = &sun;
    planet.owner = &m_players.at(static_cast<size_t>(i));
    planet.distance = (i + 1) * 100;
    planet.initial_angle = i * 3.14 / 3;
    planet.angular_velocity = 3.14 / 10;

    for (auto j = 0; j < 2; ++j) {
      auto& moon = m_planets.emplace_back();
      moon.id = next_planet_id++;
      moon.parent = &planet;
      moon.distance = (j + 1) * 10;
      moon.initial_angle = j * 3.14 / 3;
      moon.angular_velocity = 3.14 / 10;
    }
  }
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

  client->send(json::build_message(
    [&](json::Writer& writer) {
      writer.StartObject();
      writer.Key("event"); writer.String("gameJoined");

      writer.Key("planets");
      writer.StartArray();
      for (const auto& planet : m_planets) {
        writer.StartObject();
        writer.Key("id"); writer.Int(planet.id);
        writer.Key("name"); writer.String(planet.name);
        writer.Key("initialAngle"); writer.Double(planet.initial_angle);
        writer.Key("angularVelocity"); writer.Double(planet.angular_velocity);
        writer.Key("distance"); writer.Double(planet.distance);
        if (planet.parent) {
          writer.Key("parent");
          writer.Int(planet.parent->id);
        }
        if (planet.owner) {
          writer.Key("owner");
          writer.Int(planet.owner->id);
        }
        writer.EndObject();
      }
      writer.EndArray();

      writer.EndObject();
    }));

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
  const auto now = Clock::now();
  const auto time_elapsed = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_last_update_time).count();
  const auto time_since_start = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_start_time).count();
  m_last_update_time = now;

  update_planet_positions(time_since_start);

  broadcast(json::build_message(
    [&](json::Writer& writer) {
      writer.StartArray();

      writer.StartObject();
      writer.Key("event"); writer.String("update");
      writer.Key("time"); writer.Double(time_since_start);
      writer.EndObject();

      advance_squadrons(time_elapsed, writer);

      writer.EndArray();
    }));
}

void Game::update_planet_positions(double time_since_start) {
  for (auto& planet : m_planets) {
    const auto angle = planet.initial_angle +
        planet.angular_velocity * time_since_start;
    planet.x = std::cos(angle) * planet.distance;
    planet.y = std::sin(angle) * planet.distance;
    if (planet.parent) {
      planet.x += planet.parent->x;
      planet.y += planet.parent->y;
    }
  }
}

void Game::advance_squadrons(double time_elapsed, json::Writer& writer) {
  for (auto it = m_squadrons.begin(), end = m_squadrons.end(); it != end; ) {
    auto& squadron = *it;
    const auto dx = squadron.target_planet->x - squadron.x;
    const auto dy = squadron.target_planet->y - squadron.y;
    const auto distance = std::sqrt(dx * dx + dy * dy);
    if (distance < 1) {
      // TODO: fight/ add to planet
      it = m_squadrons.erase(it);

      writer.StartObject();
      writer.Key("event"); writer.String("squadronArrived");
      writer.Key("squadronId"); writer.Int(squadron.id);
      writer.EndObject();
    }
    else {
      const auto f = time_elapsed * squadron.speed / distance;
      squadron.x += dx * f;
      squadron.y += dy * f;
      ++it;
    }
  }
}

void Game::broadcast(std::string_view message) {
  for (auto [client, player] : m_clients)
    client->send(std::string(message));
}

void Game::send_squadron(Player& player, const json::Value& value) {
  auto squadron = Squadron();
  squadron.id = 1;

  // TODO:

  broadcast(json::build_message(
    [&](json::Writer& writer) {
      writer.StartObject();
      writer.Key("event"); writer.String("squadronCreated");
      writer.Key("squadronId"); writer.Int(squadron.id);
      // TODO:
      writer.EndObject();
    }));
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
