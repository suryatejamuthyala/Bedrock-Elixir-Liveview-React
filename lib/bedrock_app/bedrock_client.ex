defmodule BedrockApp.BedrockClient do
  @moduledoc """
  Client for AWS Bedrock API with streaming support
  """

  require Logger

  @default_model "anthropic.claude-3-sonnet-20240229-v1:0"
  @default_region "us-east-1"

  def stream_chat(messages, opts \\ []) do
    model = Keyword.get(opts, :model, @default_model)
    region = Keyword.get(opts, :region, @default_region)
    max_tokens = Keyword.get(opts, :max_tokens, 2048)

    payload = %{
      "anthropic_version" => "bedrock-2023-05-31",
      "max_tokens" => max_tokens,
      "messages" => messages,
      "temperature" => Keyword.get(opts, :temperature, 1.0),
      "top_p" => Keyword.get(opts, :top_p, 0.999)
    }

    body = Jason.encode!(payload)

    url = "https://bedrock-runtime.#{region}.amazonaws.com/model/#{model}/invoke-with-response-stream"

    headers = [
      {"Content-Type", "application/json"},
      {"Accept", "application/vnd.amazon.eventstream"}
    ]

    client = AWS.Client.create(
      System.get_env("AWS_ACCESS_KEY_ID"),
      System.get_env("AWS_SECRET_ACCESS_KEY"),
      region
    )

    case sign_and_request(client, url, headers, body) do
      {:ok, response} -> {:ok, response}
      {:error, reason} -> {:error, reason}
    end
  end

  defp sign_and_request(client, url, headers, body) do
    uri = URI.parse(url)

    signed_headers = AWS.Signature.sign_v4(
      client,
      DateTime.utc_now(),
      :post,
      uri.path,
      headers,
      body
    )

    :hackney.request(
      :post,
      url,
      signed_headers,
      body,
      [
        async: :once,
        stream_to: self(),
        recv_timeout: 60_000
      ]
    )
  end

  def parse_event_stream(data) do
    # Parse AWS event stream format
    # This is a simplified parser - production would need full event stream parsing
    try do
      case Jason.decode(data) do
        {:ok, json} ->
          cond do
            Map.has_key?(json, "delta") ->
              {:chunk, get_in(json, ["delta", "text"]) || ""}

            Map.has_key?(json, "message") ->
              {:message, json["message"]}

            true ->
              {:unknown, json}
          end

        {:error, _} ->
          {:raw, data}
      end
    rescue
      _ -> {:error, "Failed to parse event"}
    end
  end
end
