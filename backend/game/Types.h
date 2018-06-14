#pragma once

#include <map>
#include "Interfaces.h"

namespace game {

using FactionId = int;
using PlanetId = int;
using SquadronId = int;
struct Faction;
struct Planet;
struct Squadron;

struct Rules {
  double squadron_speed;
  double fight_duration;
};

struct Faction {
  FactionId id;
  std::string name;
  IClient* client;
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

  Faction* faction;
  std::vector<Squadron> squadrons;
  double production_progress;
  double fighters_to_destroy;
  double x;
  double y;
};

} // namespace
