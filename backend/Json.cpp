
#include <mutex>
#include "rapidjson/error/en.h"
#include "Json.h"

namespace json {

namespace {
  const Value& check_array(const Value& message, const char* name) {
    auto it = (message.IsObject() ? message.FindMember(name) : message.MemberEnd());
    if (it == message.MemberEnd() || !it->value.IsArray())
      throw Exception("array '" + std::string(name) + "' expected");
    return it->value;
  }
} // namespace

Document parse(std::string_view message) {
  auto document = rapidjson::Document();
  document.Parse(message.data(), message.size());
  if (document.HasParseError())
    throw Exception(rapidjson::GetParseError_En(
                      document.GetParseError()));
  return document;
}

int get_int(const Value& message, const char* name) {
  auto it = (message.IsObject() ? message.FindMember(name) : message.MemberEnd());
  if (it == message.MemberEnd() || !it->value.IsInt())
    throw Exception("int '" + std::string(name) + "' expected");
  return it->value.GetInt();
}

std::string_view get_string(const Value& message, const char* name) {
  auto it = (message.IsObject() ? message.FindMember(name) : message.MemberEnd());
  if (it == message.MemberEnd() || !it->value.IsString())
    throw Exception("string '" + std::string(name) + "' expected");
  return std::string_view(it->value.GetString());
}

std::vector<int> get_int_list(const Value& message, const char* name) {
  const auto& array = check_array(message, name);
  auto result = std::vector<int>();
  for (auto it = array.MemberBegin(), end = array.MemberEnd(); it != end; ++it) {
    if (!it->value.IsInt())
      throw Exception("int expected");
    result.push_back(it->value.GetInt());
  }
  return result;
}

std::string build_message(const std::function<void(Writer&)>& write) {
  static std::mutex s_mutex;
  static auto s_buffer = rapidjson::StringBuffer();
  static auto s_writer = Writer(s_buffer);
  auto lock = std::lock_guard(s_mutex);
  s_buffer.Clear();
  s_writer.Reset(s_buffer);
  write(s_writer);
  return std::string(s_buffer.GetString());
}

} // namespace
