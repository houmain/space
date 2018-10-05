import qbs

Project {

minimumQbsVersion: "1.7.1"

Application {
  name: "Webserver"
  Depends { name: "cpp" }
  cpp.cxxLanguageVersion: "c++17"
  cpp.includePaths: [ "backend", "backend/libs" ]
  cpp.defines: [ "RAPIDJSON_HAS_STDSTRING=1" ]
  consoleApplication: true
  files: [
        "backend/Interfaces.h",
        "backend/Json.cpp",
        "backend/Json.h",
        "backend/game/Messages.cpp",
        "backend/game/Messages.h",
        "backend/game/Types.h",
        "backend/libs/rapidjson/rapidjson.h",
        "backend/game/Game.cpp",
        "backend/game/Game.h",
        "backend/main.cpp",
        "backend/server/Client.cpp",
        "backend/server/Client.h",
        "backend/server/GameManager.cpp",
        "backend/server/GameManager.h",
        "backend/server/Server.cpp",
        "backend/server/Server.h",
        "backend/server/Websocket.cpp",
    ]

  Properties {
    condition: qbs.targetOS.contains("linux")
    cpp.dynamicLibraries: [ "pthread", "websockets" ]
  }

  Properties {
    condition: qbs.targetOS.contains("windows")
    cpp.cxxFlags: [ "/std:c++17" ]
    cpp.libraryPaths: [ "backend/libs/libwebsockets/lib" ]
    cpp.includePaths: [ "backend", "backend/libs", "backend/libs/libwebsockets/include" ]
    cpp.dynamicLibraries: [ "websockets_static", "ws2_32", "Shell32" ]
  }
}

} // Project
