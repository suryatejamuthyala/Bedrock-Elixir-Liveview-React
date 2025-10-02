defmodule BedrockApp.Repo do
  use Ecto.Repo,
    otp_app: :bedrock_app,
    adapter: Ecto.Adapters.Postgres
end
