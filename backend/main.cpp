
#include <csignal>
#include "server/Server.h"

namespace {
  bool g_interrupted = false;

  void open_browser(int port) {
    auto command = "http://127.0.0.1:" + std::to_string(port);
#if defined(__linux)
    command = "xdg-open '" + command + "'";
#endif
    std::system(command.c_str());
  }
} // namespace

int main(int argc, char *argv[]) {
  signal(SIGINT, [](int) { g_interrupted = true; });

  auto settings = server::Settings{ };
  settings.on_initialized =
      [port = settings.port]() { open_browser(port); };
  settings.keep_running =
      []() { return !g_interrupted; };

  // TODO: parse commandline

  server::run(settings);

  return (g_interrupted ? 0 : 1);
}
