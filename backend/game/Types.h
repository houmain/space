#pragma once

#include "Interfaces.h"

namespace game {

struct Faction {
  int id;
  std::string name;
  IClient* client;
};

struct Planet {
  int id;
  Planet* parent;
  double initial_angle;
  double angular_velocity;
  double distance;
  std::string name;
  int production_rate;

  Faction* owner;
  std::vector<int> ship_ids;
  double x;
  double y;
};

struct Ship {
  int energy;
};

struct Squadron {
  int id;
  Planet* target_planet;
  std::vector<int> ship_ids;
  double speed;

  double x;
  double y;
};

} // namespace
