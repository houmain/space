#pragma once

#include <map>
#include <chrono>
#include "Types.h"

namespace game {

class Game final : public IGame {
public:
  struct Exception : std::runtime_error {
    using runtime_error::runtime_error;
  };

  Game();
  void on_client_joined(IClient* client) override;
  void on_client_left(IClient* client) override;
  void on_message_received(IClient* client, const json::Value& value) override;
  void update() override;

private:
  using Clock = std::chrono::steady_clock;

  void broadcast(std::string_view message);
  void send_squadron(Faction& faction, const json::Value& value);
  void update_planet_production();
  void update_planet_positions(double time_since_start);
  void advance_squadrons(double time_elapsed);

  std::vector<Faction> m_factions;
  std::vector<Planet> m_planets;
  std::map<int, Ship> m_ships;
  std::map<int, Squadron> m_squadrons;

  std::map<IClient*, Faction*> m_clients;
  Clock::time_point m_start_time{ };
  Clock::time_point m_last_update_time{ };
};

} // namespace
