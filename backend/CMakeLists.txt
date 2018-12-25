cmake_minimum_required(VERSION 3.0.0)
project(Space VERSION 0.1.0)

include(CTest)
enable_testing()

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -Wall -Wno-class-memaccess")

add_compile_definitions(RAPIDJSON_HAS_STDSTRING=1)

set(SOURCES
  main.cpp
  Json.cpp
  game/Game.cpp
  game/Messages.cpp
  game/Logic.cpp
  game/Setup.cpp
  game/Player.cpp
  game/GameManager.cpp
  server/Client.cpp
  server/Server.cpp
  server/Websocket.cpp)


FILE(GLOB_RECURSE HEADERS include *.h)

add_executable(Space ${SOURCES} ${HEADERS})
target_link_libraries(Space pthread websockets)

set(CPACK_PROJECT_NAME ${PROJECT_NAME})
set(CPACK_PROJECT_VERSION ${PROJECT_VERSION})
include(CPack)
