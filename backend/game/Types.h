#pragma once

#include <map>
#include "../Interfaces.h"

namespace game {

using GameId = interfaces::GameId;
using Client = interfaces::Client;

using FactionId = int;
using PlanetId = int;
using SquadronId = int;

class Game;
class Setup;
class Logic;
class Player;

struct Faction;
struct Planet;
struct Squadron;

struct Exception : std::runtime_error {
  using runtime_error::runtime_error;
};

struct Rules {
  double squadron_speed;
  double fight_duration;
};

struct Faction {
  FactionId id;
  std::string name;
  interfaces::Client* client;

  int max_upkeep;
  int current_upkeep;
};

struct Squadron {
  SquadronId id;
  Faction* faction;
  Planet* planet;
  int fighter_count;
  double speed;

  double x;
  double y;
};

struct Planet {
  PlanetId id;
  Planet* parent;
  double initial_angle;
  double angular_velocity;
  double distance;
  std::string name;
  double production_rate;
  int max_upkeep;
  int defense_bonus;

  Faction* faction;
  std::vector<Squadron> squadrons;
  double production_progress;
  double fighters_to_destroy;
  double x;
  double y;
};

} // namespace
