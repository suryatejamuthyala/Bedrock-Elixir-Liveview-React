defmodule BedrockApp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      BedrockAppWeb.Telemetry,
      BedrockApp.Repo,
      {DNSCluster, query: Application.get_env(:bedrock_app, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: BedrockApp.PubSub},
      # Start a worker by calling: BedrockApp.Worker.start_link(arg)
      # {BedrockApp.Worker, arg},
      # Start to serve requests, typically the last entry
      BedrockAppWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: BedrockApp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BedrockAppWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
