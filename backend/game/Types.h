#pragma once

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

} // namespace
