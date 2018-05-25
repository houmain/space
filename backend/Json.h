#pragma once

#include <stdexcept>
#include <string>
#include <functional>
#include "rapidjson/document.h"
#include "rapidjson/stringbuffer.h"
#include "rapidjson/writer.h"

struct JsonException : std::runtime_error {
  using runtime_error::runtime_error;
};

using JsonValue = rapidjson::Value;
using JsonWriter = rapidjson::Writer<rapidjson::StringBuffer>;

rapidjson::Document parse_json(std::string_view message);
std::string_view get_string(const JsonValue& value, const char* name);
std::string build_message(const std::function<void(JsonWriter&)>& write);
