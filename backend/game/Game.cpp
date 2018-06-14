
#include <cassert>
#include <cmath>
#include "Game.h"
#include "Messages.h"

namespace game {

namespace {
  Squadron* find_planet_squadron(Planet& planet, const Faction* faction) {
    for (auto& squadron : planet.squadrons)
      if (squadron.faction == faction)
        return &squadron;
    return nullptr;
  }
} // namespace

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
    planet.faction = &m_factions.at(static_cast<size_t>(i));
    planet.distance = (i + 1) * 100;
    planet.initial_angle = i * 3.14 / 3;
    planet.angular_velocity = 3.14 / 10;
    planet.production_rate = 0.2;
    planet.squadrons.push_back(create_squadron(planet, 5));

    for (auto j = 0; j < 2; ++j) {
      auto& moon = m_planets.emplace_back();
      moon.id = next_planet_id++;
      moon.parent = &planet;
      moon.distance = (j + 1) * 10;
      moon.initial_angle = j * 3.14 / 3;
      moon.angular_velocity = 3.14 / 10;
      moon.production_rate = 0.02;
      moon.squadrons.push_back(create_squadron(moon, 3));
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
    m_factions, m_planets, m_moving_squadrons));

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

  update_planet_positions(time_since_start);
  update_planet_production(time_elapsed);
  update_moving_squadrons(time_elapsed);
  update_fighters(time_elapsed);
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

void Game::update_planet_production(double time_elapsed) {
  for (auto& planet : m_planets)
    if (planet.faction) {
      planet.production_progress += planet.production_rate * time_elapsed;
      if (planet.production_progress >= 1) {
        auto& squadron = planet.squadrons.at(0);
        assert(squadron.faction == planet.faction);
        squadron.fighter_count += 1;
        planet.production_progress = 0;
        broadcast(build_fighter_created_message(squadron));
      }
    }
}

void Game::update_moving_squadrons(double time_elapsed) {
  for (auto it = m_moving_squadrons.begin(),
           end = m_moving_squadrons.end(); it != end; ) {
    // advance towards target planet
    auto& squadron = *it;
    auto& planet = *squadron.planet;
    const auto dx = planet.x - squadron.x;
    const auto dy = planet.y - squadron.y;
    const auto distance = std::sqrt(dx * dx + dy * dy);
    const auto distance_covered = time_elapsed * squadron.speed;

    if (distance_covered < distance) {
      const auto f = distance_covered / distance;
      squadron.x += dx * f;
      squadron.y += dy * f;
      ++it;
      continue;
    }

    // arrived
    if (auto comrades = find_planet_squadron(planet, squadron.faction)) {
      // merge with comrades
      comrades->fighter_count += std::exchange(squadron.fighter_count, 0);
      broadcast(build_squadrons_merged_message(squadron, *comrades));
    }
    else {
      // add to list of squadrons conquering planet
      planet.squadrons.push_back(squadron);
      broadcast(build_squadron_attacks_message(squadron));
    }
    it = m_moving_squadrons.erase(it);
  }
}

void Game::update_fighters(double time_elapsed) {
  for (auto& planet : m_planets)
    if (planet.squadrons.size() > 1) {
      // TODO: fight
    }
}

void Game::send_squadron(Faction& faction, const json::Value& value) {
  auto source_planet_id = json::get_int(value, "sourcePlanetId");
  auto target_planet_id = json::get_int(value, "targetPlanetId");
  auto fighter_count = json::get_int(value, "fighterCount");
  auto& source_planet = m_planets.at(static_cast<size_t>(source_planet_id - 1));
  auto& target_planet = m_planets.at(static_cast<size_t>(target_planet_id - 1));

  // try to take fighters from source squadron
  auto source_squadron = find_planet_squadron(source_planet, &faction);
  if (!source_squadron || !source_squadron->fighter_count)
    return;
  fighter_count = std::min(source_squadron->fighter_count, fighter_count);
  source_squadron->fighter_count -= fighter_count;

  auto squadron = create_squadron(target_planet, fighter_count, &faction);
  m_moving_squadrons.push_back(squadron);
  broadcast(build_squadron_sent_message(source_planet, squadron));
}

Squadron Game::create_squadron(Planet& planet, int fighter_count,
    Faction* faction) {
  auto squadron = Squadron{ };
  squadron.id = m_next_squadron_id++;
  squadron.fighter_count = fighter_count;
  squadron.planet = &planet;
  squadron.faction = (faction ? faction : planet.faction);
  squadron.speed = 5.0;
  return squadron;
}

void Game::broadcast(std::string_view message) {
  for (auto [client, faction] : m_clients)
    client->send(std::string(message));
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
