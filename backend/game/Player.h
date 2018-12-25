#pragma once

#include "Messages.h"

namespace game {

class Player final {
public:
  Player(Game* game, ClientId client_id, PlayerId player_id);

  void setup(const messages::SetupPlayer& setup);

  const Game& game() const { return m_game; }
  const ClientId& client_id() const { return m_client_id; }
  PlayerId player_id() const { return m_player_id; }
  FactionId faction_id() const { return m_faction_id; }
  bool ready() const { return m_ready; }

private:
  Game& m_game;
  const ClientId m_client_id;
  const PlayerId m_player_id;

  FactionId m_faction_id{ };
  std::string m_name;
  std::string m_avatar;
  std::string m_color;
  bool m_ready{ };
};

} // namespace
