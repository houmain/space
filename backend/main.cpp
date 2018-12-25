
#include "server/Server.h"
#include <csignal>
#include <atomic>

namespace {
  std::atomic<bool> g_interrupted;

  [[maybe_unused]] void open_browser(int port) {
    auto command = "http://127.0.0.1:" + std::to_string(port);
#if defined(__linux)
    command = "xdg-open '" + command + "'";
#endif
    std::system(command.c_str());
  }
} // namespace

int main(int argc, char *argv[]) {
  std::signal(SIGINT, [](int) { g_interrupted.store(true); });

  auto settings = server::Settings{ };

  settings.on_initialized =
      [port = settings.port]() {
#if defined(NDEBUG)
    open_browser(port);
#endif
  };

  settings.keep_running =
      []() { return !g_interrupted.load(); };

  // TODO: parse commandline

  server::run(settings);

  return (g_interrupted.load() ? 0 : 1);
}
