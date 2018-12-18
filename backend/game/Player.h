#pragma once

#include "Messages.h"

namespace game {

class Player final {
public:
  explicit Player(Game& game);

  void setup(const SetupPlayer& setup);

  FactionId faction_id() const { return m_faction_id; }
  bool ready() const { return m_ready; }

private:
  Game& m_game;
  FactionId m_faction_id{ };
  std::string m_name;
  std::string m_avatar;
  std::string m_color;
  bool m_ready{ };
};

} // namespace
