defmodule BedrockAppWeb.Router do
  use BedrockAppWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_live_flash
    plug :put_root_layout, html: {BedrockAppWeb.Layouts, :root}
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
    plug CORSPlug, origin: ["http://localhost:5173", "http://localhost:3000"]
  end

  scope "/", BedrockAppWeb do
    pipe_through :browser

    get "/", PageController, :home
    live "/chat", ChatLive
  end

  # API routes for React frontend
  scope "/api", BedrockAppWeb do
    pipe_through :api

    post "/chat/stream", ChatController, :stream
  end
end
