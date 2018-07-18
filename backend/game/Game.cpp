
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

Game::Game()
  : m_random(std::random_device()()),
    m_start_time(Clock::now()),
    m_last_update_time(Clock::now()) {

  m_rules.squadron_speed = 50.0;
  m_rules.fight_duration = 5.0;

  for (auto i = 0; i < 4; ++i) {
    auto& faction = m_factions.emplace_back();
    faction.id = i + 1;
    faction.name = "Faction #" + std::to_string(faction.id);
  }

  auto next_planet_id = 1;
  m_planets.reserve(50);
  auto& sun = m_planets.emplace_back();
  sun.id = next_planet_id++;
  sun.x = 400;
  sun.y = 400;
  for (auto i = 0; i < 4; ++i) {
    auto& planet = m_planets.emplace_back();
    planet.id = next_planet_id++;
    planet.parent = &sun;
    planet.faction = &m_factions.at(static_cast<size_t>(i));
    planet.distance = (i + 1) * 100;
    planet.initial_angle = i * 3.14 / 3;
    planet.angular_velocity = 3.14 / 25;
    planet.production_rate = (i == 0 ? 0.4 : 0.2);
    planet.squadrons.push_back(create_squadron(planet, 5));

    for (auto j = 0; j < 2; ++j) {
      auto& moon = m_planets.emplace_back();
      moon.id = next_planet_id++;
      moon.parent = &planet;
      moon.distance = (j + 1) * 10;
      moon.initial_angle = j * 3.14 / 3;
      moon.angular_velocity = 3.14 / 25;
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
  if (action == SendSquadron::action())
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
      if (planet.production_progress >= 1.0) {
        auto& squadron = *find_planet_squadron(planet, planet.faction);
        squadron.fighter_count += 1;
        planet.production_progress = 0.0;
        broadcast(build_fighter_created_message(squadron));
      }
    }
}

void Game::update_moving_squadrons(double time_elapsed) {
  for (auto it = m_moving_squadrons.begin(); it != m_moving_squadrons.end(); ) {
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
  for (auto& planet : m_planets) {
    if (planet.squadrons.size() <= 1) {
      planet.fighters_to_destroy = 0.0;
      continue;
    }

    auto fighter_count = 0;
    for (const auto& squadron : planet.squadrons)
      fighter_count += squadron.fighter_count;
    planet.fighters_to_destroy +=
      fighter_count * time_elapsed / m_rules.fight_duration;

    while (planet.fighters_to_destroy >= 1.0) {
      if (planet.squadrons.size() <= 1) {
        planet.fighters_to_destroy = 0.0;
        break;
      }
      destroy_random_fighter(planet);
      planet.fighters_to_destroy -= 1.0;
    }
  }
}

void Game::destroy_random_fighter(Planet& planet) {
  assert(planet.squadrons.size() >= 2);

  // select firing squadron
  auto probability = std::vector<int>();
  for (auto& squadron : planet.squadrons)
    probability.push_back(squadron.fighter_count);
  const auto by_squadron_index = std::discrete_distribution<size_t>(
    begin(probability), end(probability))(m_random);

  // select hit squadron
  probability.clear();
  for (auto i = 0u; i < planet.squadrons.size(); ++i)
    probability.push_back((i == by_squadron_index ? 0 : 1));
  const auto squadron_index = std::discrete_distribution<size_t>(
    begin(probability), end(probability))(m_random);

  const auto& by_squadron = planet.squadrons[by_squadron_index];
  auto& squadron = planet.squadrons[squadron_index];
  assert(&squadron != &by_squadron);

  squadron.fighter_count -= 1;
  broadcast(build_fighter_destroyed_message(squadron, by_squadron));
  if (squadron.fighter_count == 0) {
    // squadron destroyed

    if (squadron.faction == planet.faction) {
      // defender destroyed, update planet faction
      planet.faction = by_squadron.faction;
      broadcast(build_planet_conquered_message(planet));
    }

    broadcast(build_squadron_destroyed_message(squadron));
    const auto& faction = *squadron.faction;
    planet.squadrons.erase(begin(planet.squadrons) +
      static_cast<int>(squadron_index));

    if (!faction_has_squadron(faction)) {
      broadcast(build_faction_destroyed_message(faction));
      if (auto last_faction = find_last_faction())
        broadcast(build_faction_won_message(*last_faction));
    }
  }
}

void Game::send_squadron(Faction& faction, const json::Value& value) {
  const auto message = parse_send_squadron_message(value);
  auto& source_planet = m_planets.at(
    static_cast<size_t>(message.source_planet_id - 1));
  auto& target_planet = m_planets.at(
    static_cast<size_t>(message.target_planet_id - 1));

  // try to take fighters from source squadron
  auto source_squadron = find_planet_squadron(source_planet, &faction);
  const auto fighter_count = std::min(message.fighter_count,
    (source_squadron ? source_squadron->fighter_count : 0));
  if (fighter_count > 0) {
    source_squadron->fighter_count -= fighter_count;
    auto squadron = create_squadron(target_planet, fighter_count, &faction);
    m_moving_squadrons.push_back(squadron);
    broadcast(build_squadron_sent_message(source_planet, squadron));
  }
}

Squadron Game::create_squadron(Planet& planet, int fighter_count,
    Faction* faction) {
  auto squadron = Squadron{ };
  squadron.id = m_next_squadron_id++;
  squadron.fighter_count = fighter_count;
  squadron.planet = &planet;
  squadron.faction = (faction ? faction : planet.faction);
  squadron.speed = m_rules.squadron_speed;
  return squadron;
}

bool Game::faction_has_squadron(const Faction& faction) const {
  for (const auto& planet : m_planets) {
    for (const auto& squadron : planet.squadrons)
      if (squadron.faction == &faction)
        return true;
  }
  for (const auto& squadron : m_moving_squadrons)
    if (squadron.faction == &faction)
      return true;
  return false;
}

const Faction* Game::find_last_faction() const {
  auto last_faction = static_cast<const Faction*>(nullptr);
  for (const auto& faction : m_factions)
    if (faction_has_squadron(faction))
      if (std::exchange(last_faction, &faction))
        return nullptr;
  return last_faction;
}

void Game::broadcast(std::string_view message) {
  for (auto [client, faction] : m_clients)
    client->send(std::string(message));
}

} // namespace

std::shared_ptr<IGame> create_game() {
  return std::make_shared<game::Game>();
}
