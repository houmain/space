#pragma once

#include <stdexcept>
#include <string>
#include <functional>
#include "rapidjson/document.h"
#include "rapidjson/stringbuffer.h"
#include "rapidjson/writer.h"

namespace json {

struct Exception : std::runtime_error {
  using runtime_error::runtime_error;
};

using Document = rapidjson::Document;
using Value = rapidjson::Value;
using Writer = rapidjson::Writer<rapidjson::StringBuffer>;

Document parse(std::string_view message);
int get_int(const Value& message, const char* name);
std::string_view get_string(const Value& value, const char* name);
std::vector<int> get_int_list(const Value& message, const char* name);
std::string build_message(const std::function<void(Writer&)>& write);

} // namespace
