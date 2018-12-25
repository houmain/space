
#include "Logic.h"
#include "Messages.h"
#include "Setup.h"
#include "Game.h"
#include <cassert>
#include <cmath>

namespace game {

namespace {
  Squadron* find_planet_squadron(Planet& planet, const Faction* faction) {
    for (auto& squadron : planet.squadrons)
      if (squadron.faction == faction)
        return &squadron;
    return nullptr;
  }
} // namespace

Logic::Logic(Game* game)
  : m_game(*game),
    m_random(std::random_device()()) {

  start();
}

void Logic::start() {
  const auto& setup = m_game.setup();
  m_rules.squadron_speed = 30.0;
  m_rules.fight_duration = 10.0;

  for (auto i = 0; i < setup.num_factions(); ++i) {
    auto& faction = m_factions.emplace_back();
    faction.id = i + 1;
    faction.name = "Faction #" + std::to_string(faction.id);
  }

  auto next_planet_id = 1;
  m_planets.reserve(50);
  auto& sun = m_planets.emplace_back();
  sun.id = next_planet_id++;
  for (auto i = 0; i < setup.num_planets(); ++i) {
    auto& planet = m_planets.emplace_back();
    planet.id = next_planet_id++;
    planet.parent = &sun;
    planet.faction = &m_factions.at(static_cast<size_t>(i));
    planet.distance = 200;
    planet.initial_angle = i * 6.28 / 5;
    planet.angular_velocity = 6.28 / 200;
    planet.production_rate = (i == 0 ? 0.4 : 0.2);
    planet.max_upkeep = (i == 1 ? 40 : 30);
    planet.defense_bonus = (i == 2 ? 10 : 0);
    planet.squadrons.push_back(create_squadron(planet, 5));

    for (auto j = 0; j < 2; ++j) {
      auto& moon = m_planets.emplace_back();
      moon.id = next_planet_id++;
      moon.parent = &planet;
      moon.distance = 60;
      moon.initial_angle = j * 6.28 / 3;
      moon.angular_velocity = 6.28 / 60;
      moon.production_rate = 0.1;
      moon.max_upkeep = 15;
      moon.squadrons.push_back(create_squadron(moon, 3));
    }
  }

  broadcast(messages::build_game_started(
    m_factions, m_planets, m_moving_squadrons));
}

void Logic::update() {
  const auto now = Clock::now();
  const auto time_elapsed = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_last_update_time).count();
  const auto time_since_start = std::chrono::duration_cast<
      std::chrono::duration<double>>(now - m_start_time).count();
  m_last_update_time = now;

  broadcast(messages::build_game_updated(time_since_start));

  update_faction_upkeep();
  update_planet_positions(time_since_start);
  update_planet_production(time_elapsed);
  update_moving_squadrons(time_elapsed);
  update_fighters(time_elapsed);
}

void Logic::update_faction_upkeep() {
  for (auto& faction : m_factions) {
    faction.max_upkeep = 0;
    faction.current_upkeep = 0;
  }

  for (const auto& planet : m_planets) {
    if (planet.faction)
      planet.faction->max_upkeep += planet.max_upkeep;
    for (const auto& squadron : planet.squadrons)
      if (squadron.faction)
        squadron.faction->current_upkeep += squadron.fighter_count;
  }
  for (const auto& squadron : m_moving_squadrons)
    squadron.faction->current_upkeep += squadron.fighter_count;
}

void Logic::update_planet_positions(double time_since_start) {
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

void Logic::update_planet_production(double time_elapsed) {
  for (auto& planet : m_planets)
    if (planet.faction) {
      planet.production_progress += planet.production_rate * time_elapsed;
      if (planet.production_progress >= 1.0) {

        if (planet.faction->current_upkeep >= planet.faction->max_upkeep) {
          planet.production_progress = 1.0;
          continue;
        }

        auto& squadron = *find_planet_squadron(planet, planet.faction);
        squadron.fighter_count += 1;
        planet.production_progress = 0.0;
        broadcast(messages::build_fighter_created(squadron));
      }
    }
}

void Logic::update_moving_squadrons(double time_elapsed) {
  for (auto it = m_moving_squadrons.begin(); it != m_moving_squadrons.end(); ) {
    // advance towards target planet
    auto& squadron = *it;
    const auto dx = squadron.planet->x - squadron.x;
    const auto dy = squadron.planet->y - squadron.y;
    const auto distance = std::sqrt(dx * dx + dy * dy);
    const auto distance_covered = time_elapsed * squadron.speed;

    if (distance_covered < distance) {
      const auto f = distance_covered / distance;
      squadron.x += dx * f;
      squadron.y += dy * f;
      ++it;
    }
    else {
      on_squadron_arrived(squadron);
      it = m_moving_squadrons.erase(it);
    }
  }
}

void Logic::on_squadron_arrived(Squadron& squadron) {
  auto& planet = *squadron.planet;
  if (auto comrades = find_planet_squadron(planet, squadron.faction)) {
    // merge with comrades
    comrades->fighter_count += std::exchange(squadron.fighter_count, 0);
    broadcast(messages::build_squadrons_merged(squadron, *comrades));
  }
  else {
    // add to list of squadrons conquering planet
    planet.squadrons.push_back(squadron);
    broadcast(messages::build_squadron_attacks(squadron));
  }
}

void Logic::update_fighters(double time_elapsed) {
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

void Logic::destroy_random_fighter(Planet& planet) {
  assert(planet.squadrons.size() >= 2);

  // select firing squadron
  auto probability = std::vector<int>();
  for (const auto& squadron : planet.squadrons) {
    const auto bonus =
      (squadron.faction == planet.faction ? planet.defense_bonus : 0);
    probability.push_back(squadron.fighter_count + bonus);
  }
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
  broadcast(messages::build_fighter_destroyed(squadron, by_squadron));

  if (squadron.fighter_count == 0)
    on_squadron_destroyed(squadron, by_squadron);
}

void Logic::on_squadron_destroyed(Squadron& squadron,
                                 const Squadron& by_squadron) {
  auto& planet = *squadron.planet;

  if (squadron.faction == planet.faction) {
    // defender destroyed, update planet faction
    broadcast(messages::build_planet_conquered(by_squadron));
    planet.faction = by_squadron.faction;
  }

  const auto faction = squadron.faction;
  broadcast(messages::build_squadron_destroyed(squadron));
  planet.squadrons.erase(begin(planet.squadrons) +
    std::distance(planet.squadrons.data(), &squadron));

  if (faction && !faction_has_squadron(*faction)) {
    broadcast(messages::build_faction_destroyed(*faction));
    if (auto last_faction = find_last_faction())
      broadcast(messages::build_faction_won(*last_faction));
  }
}

void Logic::send_squadron(FactionId faction_id, const messages::SendSquadron& message) {
  auto& faction = m_factions.at(static_cast<size_t>(faction_id - 1));
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
    squadron.x = source_planet.x;
    squadron.y = source_planet.y;
    m_moving_squadrons.push_back(squadron);
    broadcast(messages::build_squadron_sent(*source_squadron, squadron));
  }
}

Squadron Logic::create_squadron(Planet& planet, int fighter_count,
    Faction* faction) {
  auto squadron = Squadron{ };
  squadron.id = m_next_squadron_id++;
  squadron.fighter_count = fighter_count;
  squadron.planet = &planet;
  squadron.faction = (faction ? faction : planet.faction);
  squadron.speed = m_rules.squadron_speed;
  return squadron;
}

bool Logic::faction_has_squadron(const Faction& faction) const {
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

const Faction* Logic::find_last_faction() const {
  auto last_faction = static_cast<const Faction*>(nullptr);
  for (const auto& faction : m_factions)
    if (faction_has_squadron(faction))
      if (std::exchange(last_faction, &faction))
        return nullptr;
  return last_faction;
}

void Logic::broadcast(std::string_view message) {
  m_game.broadcast(message);
}

} // namespace
