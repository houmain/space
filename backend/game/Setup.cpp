
#include "Setup.h"
#include "Game.h"

namespace game {

Setup::Setup(Game* game)
  : m_game(*game) {
}

void Setup::setup(const messages::SetupGame& setup) {
  if (m_game.is_running())
    throw Exception("cannot change setup");

  if (setup.num_planets)
    m_num_planets = *setup.num_planets;
  if (setup.num_factions)
    m_num_factions = *setup.num_factions;

  // TODO: reset player ready status

  m_game.broadcast(build_game_setup_updated(setup));
}

} // namespace
