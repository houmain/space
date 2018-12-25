
#include "Server.h"
#include <cstring>
#include <array>
#include <libwebsockets.h>

namespace server {

extern lws_protocols websocket_protocol();

void run(const Settings& settings) noexcept {
  const lws_protocols protocols[] = {
    { "http", lws_callback_http_dummy, 0, 0, 0, nullptr, 0 },
    websocket_protocol(),
    { }
  };

  const lws_extension extensions[] = {
    {
      "permessage-deflate",
      lws_extension_callback_pm_deflate,
      "permessage-deflate"
    },
    {
      "deflate-frame",
      lws_extension_callback_pm_deflate,
      "deflate_frame"
    },
    { }
  };

  lws_protocol_vhost_options mime_types[] = {
    { nullptr, nullptr, ".json", "application/json" },
    { nullptr, nullptr, ".jpg", "image/jpeg" },
    { nullptr, nullptr, ".ogg", "audio/x-vorbis+ogg" }
  };
  for (auto i = 0u; i < std::size(mime_types) - 1; ++i)
    mime_types[i].next = &mime_types[i + i];

  auto mount = lws_http_mount{ };
  mount.mountpoint = "/";
  mount.mountpoint_len = static_cast<unsigned char>(
      std::strlen(mount.mountpoint));
  mount.origin = settings.document_path.c_str();
  mount.origin_protocol = LWSMPRO_FILE;
  mount.def = "index.html";
  mount.extra_mimetypes = mime_types;

#if !defined(_DEBUG)
  auto files_mount = lws_http_mount{ };
  mount.mount_next = &files_mount;
  files_mount.mountpoint = "/files";
  files_mount.mountpoint_len = static_cast<unsigned char>(
      std::strlen(files_mount.mountpoint));
  files_mount.origin = (settings.document_path + "files.zip").c_str();
  files_mount.origin_protocol = LWSMPRO_FILE;
  files_mount.extra_mimetypes = mime_types;
#endif

  auto info = lws_context_creation_info{ };
  info.port = settings.port;
  info.mounts = &mount;
  info.protocols = protocols;
  info.extensions = extensions;
  info.options = LWS_SERVER_OPTION_VALIDATE_UTF8;
  info.max_http_header_pool = 16;
  info.timeout_secs = 5;

#if !defined(_DEBUG)
  info.error_document_404 = ".";
#endif

  lws_set_log_level(LLL_USER | LLL_ERR | LLL_WARN | LLL_NOTICE, nullptr);

  if (auto context = lws_create_context(&info)) {
    if (settings.on_initialized)
      settings.on_initialized();

    while (settings.keep_running())
      if (lws_service(context, 1000) != 0)
        break;

    lws_context_destroy(context);
  }
}

} // namespace
