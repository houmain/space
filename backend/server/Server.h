#pragma once

#include <functional>
#include <string>

namespace server {

struct Settings {
  std::string document_path{ "./" };
  int port{ 9995 };
  std::function<void()> on_initialized;
  std::function<bool()> keep_running;
};

void run(const Settings& settings) noexcept;

} // namespace
