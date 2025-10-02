defmodule BedrockAppWeb.ChatLive do
  use BedrockAppWeb, :live_view
  require Logger

  @impl true
  def mount(_params, _session, socket) do
    {:ok,
     socket
     |> assign(:messages, [])
     |> assign(:input, "")
     |> assign(:streaming, false)
     |> assign(:current_response, "")}
  end

  @impl true
  def handle_event("send_message", %{"message" => message}, socket) do
    if String.trim(message) != "" do
      # Add user message
      messages = socket.assigns.messages ++ [%{role: "user", content: message}]

      # Start streaming response
      send(self(), {:stream_bedrock, messages})

      {:noreply,
       socket
       |> assign(:messages, messages)
       |> assign(:input, "")
       |> assign(:streaming, true)
       |> assign(:current_response, "")}
    else
      {:noreply, socket}
    end
  end

  @impl true
  def handle_event("update_input", %{"value" => value}, socket) do
    {:noreply, assign(socket, :input, value)}
  end

  @impl true
  def handle_info({:stream_bedrock, messages}, socket) do
    # Convert messages to Bedrock format
    bedrock_messages =
      Enum.map(messages, fn msg ->
        %{"role" => msg.role, "content" => msg.content}
      end)

    # Start streaming
    Task.start(fn ->
      case BedrockApp.BedrockClient.stream_chat(bedrock_messages) do
        {:ok, request_id} ->
          send(self(), {:stream_started, request_id})
          receive_stream(request_id)

        {:error, reason} ->
          send(self(), {:stream_error, reason})
      end
    end)

    {:noreply, socket}
  end

  @impl true
  def handle_info({:stream_chunk, chunk}, socket) do
    current_response = socket.assigns.current_response <> chunk

    # Broadcast to connected clients via Phoenix PubSub
    Phoenix.PubSub.broadcast(
      BedrockApp.PubSub,
      "chat:stream",
      {:stream_chunk, chunk}
    )

    {:noreply, assign(socket, :current_response, current_response)}
  end

  @impl true
  def handle_info({:stream_complete, full_response}, socket) do
    messages =
      socket.assigns.messages ++
        [%{role: "assistant", content: full_response}]

    # Broadcast completion
    Phoenix.PubSub.broadcast(
      BedrockApp.PubSub,
      "chat:stream",
      {:stream_complete, full_response}
    )

    {:noreply,
     socket
     |> assign(:messages, messages)
     |> assign(:streaming, false)
     |> assign(:current_response, "")}
  end

  @impl true
  def handle_info({:stream_error, reason}, socket) do
    Logger.error("Stream error: #{inspect(reason)}")

    Phoenix.PubSub.broadcast(
      BedrockApp.PubSub,
      "chat:stream",
      {:stream_error, reason}
    )

    {:noreply, assign(socket, :streaming, false)}
  end

  @impl true
  def handle_info({:stream_started, _request_id}, socket) do
    {:noreply, socket}
  end

  defp receive_stream(request_id) do
    receive do
      {:hackney_response, ^request_id, {:status, _status, _reason}} ->
        receive_stream(request_id)

      {:hackney_response, ^request_id, {:headers, _headers}} ->
        receive_stream(request_id)

      {:hackney_response, ^request_id, chunk} when is_binary(chunk) ->
        case BedrockApp.BedrockClient.parse_event_stream(chunk) do
          {:chunk, text} when text != "" ->
            send(self(), {:stream_chunk, text})
            receive_stream(request_id)

          _ ->
            receive_stream(request_id)
        end

      {:hackney_response, ^request_id, :done} ->
        send(self(), {:stream_complete, ""})

      {:hackney_response, ^request_id, {:error, reason}} ->
        send(self(), {:stream_error, reason})
    after
      60_000 ->
        send(self(), {:stream_error, :timeout})
    end
  end

  @impl true
  def render(assigns) do
    ~H"""
    <div class="container mx-auto p-4 max-w-4xl">
      <h1 class="text-3xl font-bold mb-6">AWS Bedrock Chat</h1>

      <div class="bg-white shadow-lg rounded-lg p-6 mb-4 h-96 overflow-y-auto" id="messages">
        <%= for message <- @messages do %>
          <div class={"mb-4 #{if message.role == "user", do: "text-right", else: "text-left"}"}>
            <div class={"inline-block px-4 py-2 rounded-lg #{if message.role == "user", do: "bg-blue-500 text-white", else: "bg-gray-200"}"}>
              <p class="text-sm font-semibold mb-1"><%= message.role %></p>
              <p><%= message.content %></p>
            </div>
          </div>
        <% end %>

        <%= if @streaming && @current_response != "" do %>
          <div class="mb-4 text-left">
            <div class="inline-block px-4 py-2 rounded-lg bg-gray-200">
              <p class="text-sm font-semibold mb-1">assistant</p>
              <p><%= @current_response %></p>
              <span class="animate-pulse">▋</span>
            </div>
          </div>
        <% end %>
      </div>

      <form phx-submit="send_message" class="flex gap-2">
        <input
          type="text"
          name="message"
          value={@input}
          phx-change="update_input"
          placeholder="Type your message..."
          class="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={@streaming}
        />
        <button
          type="submit"
          class="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          disabled={@streaming}
        >
          <%= if @streaming, do: "Sending...", else: "Send" %>
        </button>
      </form>
    </div>
    """
  end
end
