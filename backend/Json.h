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
std::string_view get_string(const Value& value, const char* name);
std::string build_message(const std::function<void(Writer&)>& write);

} // namespace
