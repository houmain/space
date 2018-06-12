
#include <cassert>
#include <cmath>
#include "Game.h"
#include "Messages.h"

namespace game {

Game::Game() {
  m_start_time = Clock::now();
  m_last_update_time = Clock::now();

  for (auto i = 0; i < 4; ++i) {
    auto& faction = m_factions.emplace_back();
    faction.id = i + 1;
    faction.name = "Faction #" + std::to_string(faction.id);
  }

  auto next_planet_id = 1;
  m_planets.reserve(50);
  auto& sun = m_planets.emplace_back();
  sun.id = next_planet_id++;
  for (auto i = 0; i < 4; ++i) {
    auto& planet = m_planets.emplace_back();
    planet.id = next_planet_id++;
    planet.parent = &sun;
    planet.owner = &m_factions.at(static_cast<size_t>(i));
    planet.distance = (i + 1) * 100;
    planet.initial_angle = i * 3.14 / 3;
    planet.angular_velocity = 3.14 / 10;
    planet.production_rate = 10;

    for (auto j = 0; j < 2; ++j) {
      auto& moon = m_planets.emplace_back();
      moon.id = next_planet_id++;
      moon.parent = &planet;
      moon.distance = (j + 1) * 10;
      moon.initial_angle = j * 3.14 / 3;
      moon.angular_velocity = 3.14 / 10;
      moon.production_rate = 3;
    }
  }
}

void Game::on_client_joined(IClient* client) {
  assert(!m_clients.count(client));

  auto faction = [&]() {
    for (auto& faction : m_factions)
      if (!faction.client)
        return &faction;
    throw Exception("no faction left");
  }();

  m_clients[client] = faction;
  faction->client = client;

  client->send(build_game_joined_message(
    m_factions, m_planets, m_ships, m_squadrons));

  broadcast(build_player_joined_message(*client, *faction));
}

void Game::on_client_left(IClient* client) {
  assert(m_clients.count(client));

  auto faction = m_clients[client];
  broadcast(build_player_left_message(*client, *faction));

  faction->client = nullptr;
  m_clients.erase(client);
}

void Game::on_message_received(IClient* client, const json::Value& value) {
  auto it = m_clients.find(client);
  if (it == cend(m_clients))
    return;
  auto& faction = *it->second;

  const auto action = json::get_string(value, "action");
  if (action == "sendSquadron")
    return send_squadron(faction, value);

  throw Exception("invalid action");
}

void Game::update() {
  const auto now = Clock::now();
  const auto time_elapsed = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_last_update_time).count();
  const auto time_since_start = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_start_time).count();
  m_last_update_time = now;

  broadcast(build_game_updated_message(time_since_start));

  update_planet_production();
  update_planet_positions(time_since_start);
  advance_squadrons(time_elapsed);
}

void Game::update_planet_production() {
  for (auto& planet : m_planets) {

  }
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

void Game::advance_squadrons(double time_elapsed) {
  for (auto it = m_squadrons.begin(), end = m_squadrons.end(); it != end; ) {
    auto& squadron = it->second;
    const auto dx = squadron.target_planet->x - squadron.x;
    const auto dy = squadron.target_planet->y - squadron.y;
    const auto distance = std::sqrt(dx * dx + dy * dy);
    if (distance < 1) {
      // TODO: fight/ add to planet
      it = m_squadrons.erase(it);

      broadcast(build_squadron_arrived_message(squadron));
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
  for (auto [client, faction] : m_clients)
    client->send(std::string(message));
}

void Game::send_squadron(Faction& faction, const json::Value& value) {
  auto squadron = Squadron();
  squadron.id = 1;

  // TODO:

  broadcast(build_squadron_created_message(squadron));
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
