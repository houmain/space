#pragma once

#include <chrono>
#include <random>
#include "Messages.h"

namespace game {

class Logic {
public:
  explicit Logic(Game& game);
  void start(const Setup& setup);
  void update();
  void send_squadron(FactionId factionId, const SendSquadron& value);

private:
  using Clock = std::chrono::steady_clock;

  Squadron create_squadron(Planet& planet,
    int fighter_count, Faction* faction = nullptr);
  void broadcast(std::string_view message);
  void update_faction_upkeep();
  void update_planet_positions(double time_since_start);
  void update_planet_production(double time_elapsed);
  void update_moving_squadrons(double time_elapsed);
  void on_squadron_arrived(Squadron& squadron);
  void update_fighters(double time_elapsed);
  void destroy_random_fighter(Planet& planet);
  void on_squadron_destroyed(Squadron& squadron, const Squadron& by_squadron);
  bool faction_has_squadron(const Faction& faction) const;
  const Faction* find_last_faction() const;

  Game& m_game;
  std::mt19937 m_random;
  Rules m_rules{ };
  std::vector<Faction> m_factions;
  std::vector<Planet> m_planets;
  std::vector<Squadron> m_moving_squadrons;

  Clock::time_point m_start_time{ };
  Clock::time_point m_last_update_time{ };
  SquadronId m_next_squadron_id{ 1 };
};

} // namespace
