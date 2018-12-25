
#include "../Interfaces.h"
#include <iostream>
#include <algorithm>
#include <vector>
#include <mutex>
#include <deque>
#include <libwebsockets.h>

namespace {
  class WebsocketSession;
  std::vector<WebsocketSession*> g_sessions;

  class WebsocketSession {
  public:
    explicit WebsocketSession(lws* wsi);
    WebsocketSession(const WebsocketSession&) = delete;
    WebsocketSession& operator=(const WebsocketSession&) = delete;
    ~WebsocketSession();

    lws* wsi() const { return m_wsi; }
    void send(std::string&& message);
    void on_websocket_writeable();
    void on_websocket_receive(const char* data, size_t size);

  private:
    using Client = interfaces::Client;

    lws* const m_wsi;
    lws_context* const m_context;
    std::unique_ptr<Client> m_client;

    std::string m_receive_buffer;

    std::mutex m_write_queue_mutex;
    std::deque<std::string> m_write_queue;
    bool m_write_continuation{ };
  };

  WebsocketSession::WebsocketSession(lws* wsi)
    : m_wsi(wsi),
      m_context(lws_get_context(wsi)) {

    auto send = [this](std::string&& message) { this->send(std::move(message)); };

    m_client = interfaces::create_client(std::move(send));
    g_sessions.push_back(this);
  }

  WebsocketSession::~WebsocketSession() {
    g_sessions.erase(std::find(begin(g_sessions), end(g_sessions), this));
  }

  void WebsocketSession::send(std::string&& message) {
    auto lock = std::lock_guard(m_write_queue_mutex);
    m_write_queue.push_back(std::move(message));

    // cause a LWS_CALLBACK_EVENT_WAIT_CANCELLED
    lws_cancel_service(m_context);
  }

  void WebsocketSession::on_websocket_writeable() {
    auto lock = std::lock_guard(m_write_queue_mutex);
    if (m_write_queue.empty())
      return;

    const auto max_size = size_t{ 4096 };
    auto& buffer = m_write_queue.front();
    auto size = buffer.size();
    auto flags = int{ m_write_continuation ?
      LWS_WRITE_CONTINUATION : LWS_WRITE_TEXT };
    if (size > max_size) {
      size = max_size;
      flags |= LWS_WRITE_NO_FIN;
    }

    // prepend LWS_PRE bytes, as expected by lws_write
    buffer.insert(begin(buffer), LWS_PRE, '\0');
    auto data = reinterpret_cast<unsigned char*>(buffer.data() + LWS_PRE);

    auto written = lws_write(m_wsi, data, size,
      static_cast<lws_write_protocol>(flags));
    if (written != static_cast<int>(size))
      throw std::runtime_error("writing failed");

    buffer.erase(begin(buffer), begin(buffer) + LWS_PRE + written);
    if (buffer.empty()) {
      m_write_queue.pop_front();
      m_write_continuation = false;
    }
    else {
      m_write_continuation = true;
    }

    if (!m_write_queue.empty())
      lws_callback_on_writable(m_wsi);
  }

  void WebsocketSession::on_websocket_receive(const char* data, size_t size) {
    const auto fragmented = (lws_is_first_fragment(m_wsi) ||
                             !m_receive_buffer.empty());
    if (fragmented) {
      m_receive_buffer.insert(end(m_receive_buffer), data, data + size);
      data = m_receive_buffer.data();
      size = m_receive_buffer.size();
    }
    if (!fragmented || lws_is_final_fragment(m_wsi)) {
      m_client->on_received(data);
      m_receive_buffer.clear();
    }
  }

  int websocket_callback(lws* wsi, lws_callback_reasons reason,
                         void* user, void* in, size_t len) {
    try {
      auto& session = *reinterpret_cast<WebsocketSession**>(user);
      switch (reason) {
        case LWS_CALLBACK_ESTABLISHED:
          session = new WebsocketSession(wsi);
          break;

        case LWS_CALLBACK_CLOSED:
          delete session;
          break;

        case LWS_CALLBACK_SERVER_WRITEABLE:
          session->on_websocket_writeable();
          break;

        case LWS_CALLBACK_RECEIVE:
          session->on_websocket_receive(
            static_cast<const char*>(in), len);
          break;

        case LWS_CALLBACK_EVENT_WAIT_CANCELLED:
          for (const auto& session : g_sessions)
            lws_callback_on_writable(session->wsi());
          break;

        default:
          break;
      }
      return 0;
    }
    catch (const std::exception& ex) {
      std::cerr << "exception: " << ex.what() << std::endl;
      lws_close_reason(wsi,
        LWS_CLOSE_STATUS_PROTOCOL_ERR, nullptr, 0);
      return -1;
    }
  }
} // namespace

namespace server {

lws_protocols websocket_protocol() {
  return { "websocket", websocket_callback,
    sizeof(WebsocketSession), 0, 0, nullptr, 0 };
}

} // namespace
