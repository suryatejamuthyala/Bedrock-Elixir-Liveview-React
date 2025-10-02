defmodule BedrockAppWeb.ChatController do
  use BedrockAppWeb, :controller
  require Logger

  def stream(conn, %{"messages" => messages}) do
    conn =
      conn
      |> put_resp_content_type("text/event-stream")
      |> send_chunked(200)

    # Convert messages to Bedrock format
    bedrock_messages =
      Enum.map(messages, fn msg ->
        %{"role" => msg["role"], "content" => msg["content"]}
      end)

    # Stream response
    case BedrockApp.BedrockClient.stream_chat(bedrock_messages) do
      {:ok, request_id} ->
        stream_to_client(conn, request_id)

      {:error, reason} ->
        error_data = Jason.encode!(%{error: inspect(reason)})
        chunk(conn, "data: #{error_data}\n\n")
        conn
    end
  end

  defp stream_to_client(conn, request_id) do
    receive do
      {:hackney_response, ^request_id, {:status, _status, _reason}} ->
        stream_to_client(conn, request_id)

      {:hackney_response, ^request_id, {:headers, _headers}} ->
        stream_to_client(conn, request_id)

      {:hackney_response, ^request_id, chunk} when is_binary(chunk) ->
        case BedrockApp.BedrockClient.parse_event_stream(chunk) do
          {:chunk, text} when text != "" ->
            # Send as Server-Sent Events format
            data = Jason.encode!(%{type: "chunk", content: text})
            case chunk(conn, "data: #{data}\n\n") do
              {:ok, conn} -> stream_to_client(conn, request_id)
              {:error, _reason} -> conn
            end

          _ ->
            stream_to_client(conn, request_id)
        end

      {:hackney_response, ^request_id, :done} ->
        data = Jason.encode!(%{type: "done"})
        chunk(conn, "data: #{data}\n\n")
        conn

      {:hackney_response, ^request_id, {:error, reason}} ->
        error_data = Jason.encode!(%{type: "error", error: inspect(reason)})
        chunk(conn, "data: #{error_data}\n\n")
        conn
    after
      60_000 ->
        timeout_data = Jason.encode!(%{type: "error", error: "timeout"})
        chunk(conn, "data: #{timeout_data}\n\n")
        conn
    end
  end
end
