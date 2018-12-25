#pragma once

#include "Messages.h"

namespace game {

class Setup final {
public:
  explicit Setup(Game* game);
  void setup(const messages::SetupGame& setup);

  int num_factions() const { return m_num_factions; }
  int num_planets() const { return m_num_planets; }

private:
  Game& m_game;
  int m_num_factions{ };
  int m_num_planets{ };
};

} // namespace
