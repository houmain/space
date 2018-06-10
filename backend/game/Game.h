#pragma once

#include <map>
#include <chrono>
#include "Interfaces.h"

namespace game {

struct Player {
  int id;
  IClient* client;
};

struct Ship {
  int energy;
};

struct Planet {
  int id;
  Planet* parent;
  double initial_angle;
  double angular_velocity;
  double distance;
  std::string name;

  Player* owner;
  std::vector<int> ship_ids;
  double x;
  double y;
};

struct Squadron {
  int id;
  Planet* target_planet;
  std::vector<int> ship_ids;
  double speed;

  double x;
  double y;
};

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
  void send_squadron(Player& player, const json::Value& value);
  void update_planet_positions(double time_since_start);
  void advance_squadrons(double time_elapsed, json::Writer& writer);

  std::vector<Player> m_players;
  std::vector<Planet> m_planets;
  std::vector<Ship> m_ships;
  std::vector<Squadron> m_squadrons;

  std::map<IClient*, Player*> m_clients;

  Clock::time_point m_start_time{ };
  Clock::time_point m_last_update_time{ };
};

} // namespace
