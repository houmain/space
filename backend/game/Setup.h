#pragma once

#include "Messages.h"

namespace game {

class Setup final {
public:
  void setup(const SetupGame& setup);

  int num_factions() const { return m_num_factions; }
  int num_planets() const { return m_num_planets; }

private:
  int m_num_factions{ };
  int m_num_planets{ };
};

} // namespace
