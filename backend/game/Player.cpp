
#include "Player.h"
#include "Game.h"

namespace game {

Player::Player(Game* game, ClientId client_id, PlayerId player_id)
  : m_game(*game),
    m_client_id(std::move(client_id)),
    m_player_id(player_id) {
}

void Player::setup(const messages::SetupPlayer& setup) {
  if (m_game.is_running())
    throw Exception("cannot change player setup");

  if (setup.name)
    m_name = *setup.name;
  if (setup.avatar)
    m_avatar = *setup.avatar;
  if (setup.color)
    m_color = *setup.color;
  if (setup.faction_id)
    m_faction_id = *setup.faction_id;
  if (setup.ready)
    m_ready = *setup.ready;

  m_game.broadcast(build_player_setup_updated(setup));
}

} // namespace
