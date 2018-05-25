
#include <mutex>
#include "rapidjson/error/en.h"
#include "Json.h"

rapidjson::Document parse_json(std::string_view message) {
  auto document = rapidjson::Document();
  document.Parse(message.data(), message.size());
  if (document.HasParseError())
    throw JsonException(rapidjson::GetParseError_En(
                      document.GetParseError()));
  return document;
}

std::string_view get_string(const JsonValue& message, const char* name) {
  if (!message.IsObject() ||
      !message.HasMember(name) ||
      !message[name].IsString())
    throw JsonException("property '" + std::string(name) + "' missing");

  return std::string_view(message[name].GetString());
}

std::string build_message(const std::function<void(JsonWriter&)>& write) {
  static std::mutex s_mutex;
  static auto s_buffer = rapidjson::StringBuffer();
  static auto s_writer = JsonWriter(s_buffer);
  auto lock = std::lock_guard(s_mutex);
  s_buffer.Clear();
  s_writer.Reset(s_buffer);
  write(s_writer);
  return std::string(s_buffer.GetString());
}
