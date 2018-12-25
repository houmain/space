#pragma once

#include "../Interfaces.h"
#include <variant>

namespace server {

struct Exception : std::runtime_error {
  using runtime_error::runtime_error;
};

class Client final : public interfaces::Client {
public:
  explicit Client(interfaces::SendFunction send);
  ~Client() override;

  void send(std::string message) override;
  void on_received(std::string_view message) override;

private:
  const interfaces::SendFunction m_send;
};

} // namespace
